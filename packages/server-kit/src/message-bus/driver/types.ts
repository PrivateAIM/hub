/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageBusPayload, MessageBusRouting } from '../types';

export interface IMessageBusDriver {
    publish(routing: MessageBusRouting, message: MessageBusPayload): Promise<boolean>;
    consume(routing: MessageBusRouting, handler: (payload: MessageBusPayload) => Promise<void> | void): Promise<void>;
}
