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
import { BaseAPI } from '../base';

function buildPullQuery(query?: MessagePullQuery): string {
    if (!query) {
        return '';
    }

    const params = new URLSearchParams();
    if (typeof query.limit !== 'undefined') {
        params.set('limit', `${query.limit}`);
    }
    if (typeof query.wait !== 'undefined') {
        params.set('wait', `${query.wait}`);
    }

    const serialized = params.toString();
    return serialized.length > 0 ? `?${serialized}` : '';
}

export class MessageAPI extends BaseAPI {
    /**
     * Send a message to one or more recipients. The sender is the authenticated
     * identity; the hub persists one durable row per recipient. The analysis
     * scope (if any) travels in `metadata.analysisId`. Returns the ids of the
     * persisted messages.
     */
    async send(data: SendMessageRequest): Promise<string[]> {
        const { data: response } = await this.client.post('messages', data);
        return response.data ?? [];
    }

    /**
     * Pull the calling identity's pending (un-acked) messages, oldest first.
     * Process them and `ack` their ids to delete them (delete-on-ack).
     */
    async pull(query?: MessagePullQuery): Promise<MessagePullResponse> {
        const { data } = await this.client.get(`messages${buildPullQuery(query)}`);
        return data;
    }

    /**
     * Acknowledge messages by id — the hub deletes them for the caller.
     */
    async ack(data: MessageAckRequest): Promise<void> {
        await this.client.post('messages/ack', data);
    }
}
