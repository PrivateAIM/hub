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
    if (typeof query.after !== 'undefined') {
        params.set('after', query.after);
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
     * scope (if any) travels in `metadata.analysisId`.
     */
    async send(data: SendMessageRequest): Promise<void> {
        await this.client.post('messages', data);
    }

    /**
     * Node-level long-poll: pull every pending message addressed to the calling
     * identity, plus the cursor to ack / pass as `after` on the next pull.
     */
    async pull(query?: MessagePullQuery): Promise<MessagePullResponse> {
        const { data } = await this.client.get(`messages${buildPullQuery(query)}`);
        return data;
    }

    /**
     * Acknowledge up to and including `cursor` — the hub deletes those messages.
     */
    async ack(data: MessageAckRequest): Promise<void> {
        await this.client.post('messages/ack', data);
    }
}
