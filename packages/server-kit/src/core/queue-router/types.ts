/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';

export type QueueRouterHandlerContext = {
    command: string,
    data: Record<string, any>,
};

export type QueueRouterHandler<T = QueueRouterHandlerContext> = (ctx: T) => Promise<void> | void;

export type QueueRouterCreateContext = {
    routingKey: string,
    handlers: Record<string, QueueRouterHandler>,
};

export type QueueRouterPayload<T extends ObjectLiteral = ObjectLiteral> = {
    data: T,
    metadata: {
        command: string,
        event?: string,
        component: string
    }
};
