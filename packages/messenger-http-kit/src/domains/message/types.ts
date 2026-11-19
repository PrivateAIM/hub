/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MessageAckRequest,
    MessagePendingEvent,
    MessagePullQuery,
    MessagePullResponse,
    SendMessageRequest,
    WakeupEventName,
} from '@privateaim/messenger-kit';
import type { APIRequestOptions } from '../types';

/**
 * A typed wakeup read from `GET /messages/stream`. `type` discriminates the
 * union; `lastEventId` and `retry` are the stream state hapic's parser carries
 * (the last `id` / valid `retry` field seen so far; the hub sends neither today).
 */
export type MessageStreamEvent = {
    type: `${WakeupEventName.MESSAGE_PENDING}`,
    data: MessagePendingEvent,
    lastEventId: string,
    retry?: number
};

/**
 * Aborting `signal` closes the stream and ends the iteration without an
 * error. The stream is sent with `timeout: 0` unless `timeout` is set: the
 * deadline would keep running while the stream is read.
 */
export type MessageSubscribeOptions = APIRequestOptions;

/**
 * NOT an entity API: the broker surface is a protocol, not a CRUD resource.
 * Nothing here carries the `{ data, meta }` envelope, and the pull query is
 * hand-rolled `URLSearchParams` rather than rapiq.
 */
export interface IMessageAPI {
    send(data: SendMessageRequest, options?: APIRequestOptions) : Promise<string[]>;
    pull(query?: MessagePullQuery) : Promise<MessagePullResponse>;
    ack(data: MessageAckRequest, options?: APIRequestOptions) : Promise<void>;
    /**
     * Open the caller's wakeup stream and yield its typed events. The request
     * is sent on the first iteration; one response is read, without
     * reconnecting, and the iteration ends when the server closes the stream
     * or the signal aborts.
     */
    subscribe(options?: MessageSubscribeOptions) : AsyncIterable<MessageStreamEvent>;
}
