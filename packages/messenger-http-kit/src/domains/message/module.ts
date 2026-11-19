/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MessageAckRequest,
    MessagePullQuery,
    MessagePullResponse,
    SendMessageRequest,
} from '@privateaim/messenger-kit';
import { BaseAPI, parseEventStream } from 'hapic';
import type { EventStreamMessage } from 'hapic';
import type { APIRequestOptions } from '../types';
import { buildRequestConfig } from '../utils';
import { toMessageStreamEvent } from './helpers';
import type { IMessageAPI, MessageStreamEvent, MessageSubscribeOptions } from './types';

export class MessageAPI extends BaseAPI implements IMessageAPI {
    /**
     * Send a message to one or more recipients. The sender is the authenticated
     * identity; the hub persists one durable row per recipient. The analysis
     * scope (if any) travels in `metadata.analysisId`. Returns the ids of the
     * persisted messages.
     */
    async send(data: SendMessageRequest, options?: APIRequestOptions): Promise<string[]> {
        const { data: response } = await this.client.post('messages', data, buildRequestConfig(options));

        return response.data ?? [];
    }

    /**
     * Pull the calling identity's pending (un-acked) messages, oldest first.
     * Process them and `ack` their ids to delete them (delete-on-ack).
     */
    async pull(query?: MessagePullQuery, options?: APIRequestOptions): Promise<MessagePullResponse> {
        const config = buildRequestConfig(options) ?? {};

        // A long-poll parks up to `wait` ms on the server: extend the
        // deadline (the call's own, else the client's) by it, so an empty
        // mailbox is not a timeout.
        const timeout = config.timeout ?? this.client.defaults.timeout;

        if (
            query &&
            typeof query.wait === 'number' && query.wait > 0 &&
            typeof timeout === 'number' && timeout > 0
        ) {
            config.timeout = timeout + query.wait;
        }

        // hapic serializes `query` and drops an undefined `limit` / `wait`.
        const { data } = await this.client.get('messages', {
            ...config,
            query: {
                limit: query?.limit,
                wait: query?.wait,
            },
        });

        return { messages: Array.isArray(data.messages) ? data.messages : [] };
    }

    /**
     * Acknowledge messages by id — the hub deletes them for the caller.
     */
    async ack(data: MessageAckRequest, options?: APIRequestOptions): Promise<void> {
        await this.client.post('messages/ack', data, buildRequestConfig(options));
    }

    /**
     * Read the caller's `GET /messages/stream` and yield its typed wakeups.
     * Keep-alives and unknown event types are skipped. On each wakeup (the hub
     * also sends one on connect) `pull()` the mailbox.
     *
     * One response is read; there is no reconnect. When the iteration ends
     * without an abort, the server closed the stream: reconnect, then pull.
     */
    async* subscribe(options: MessageSubscribeOptions = {}): AsyncGenerator<MessageStreamEvent> {
        const { signal } = options;

        if (signal?.aborted) {
            return;
        }

        let body : ReadableStream<Uint8Array>;

        try {
            const response = await this.client.get('messages/stream', {
                responseType: 'stream',
                headers: { accept: 'text/event-stream' },
                // LOAD-BEARING: hapic's deadline keeps running while a stream
                // body is read, so a client-level `timeout` would cut this
                // open-ended stream. 0 disables it for this call only,
                // unless the caller sets one.
                timeout: 0,
                ...buildRequestConfig(options),
            });

            if (!(response.data instanceof ReadableStream)) {
                throw new TypeError('The message stream response has no body.');
            }

            body = response.data;
        } catch (e) {
            if (signal?.aborted) {
                return;
            }

            throw e;
        }

        const reader = parseEventStream(body).getReader();

        try {
            while (!signal?.aborted) {
                let result : ReadableStreamReadResult<EventStreamMessage>;

                try {
                    result = await reader.read();
                } catch (e) {
                    if (signal?.aborted) {
                        return;
                    }

                    throw e;
                }

                if (result.done) {
                    return;
                }

                const event = toMessageStreamEvent(result.value);

                if (event) {
                    yield event;
                }
            }
        } finally {
            // closes the connection when the consumer stops early (`break`)
            await reader.cancel().catch(() => undefined);
        }
    }
}
