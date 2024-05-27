/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueueRouterStrategy } from './strategies';
import type {
    QueueRouterHandlers,
    QueueRouterPayload,
} from './types';

export class QueueRouter {
    protected strategy : QueueRouterStrategy;

    //----------------------------------------------------------------

    constructor(driver: QueueRouterStrategy) {
        this.strategy = driver;
    }

    //----------------------------------------------------------------

    publish(to: string, message: QueueRouterPayload) : Promise<boolean> {
        return this.strategy.publish(to, message);
    }

    consume(from: string, handlers: QueueRouterHandlers) : Promise<void> {
        return this.strategy.consume(from, handlers);
    }
}
