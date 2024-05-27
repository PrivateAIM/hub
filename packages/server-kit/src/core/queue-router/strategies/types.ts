/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueueRouterHandlers, QueueRouterPayload } from '../types';

export interface QueueRouterStrategy {
    publish(to: string, message: QueueRouterPayload) : Promise<boolean>;
    consume(from: string, handlers: QueueRouterHandlers) : Promise<void>;
}
