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

/**
 * NOT an entity API: the broker surface is a protocol, not a CRUD resource.
 * Nothing here carries the `{ data, meta }` envelope, and the pull query is
 * hand-rolled `URLSearchParams` rather than rapiq.
 */
export interface IMessageAPI {
    send(data: SendMessageRequest) : Promise<string[]>;
    pull(query?: MessagePullQuery) : Promise<MessagePullResponse>;
    ack(data: MessageAckRequest) : Promise<void>;
}
