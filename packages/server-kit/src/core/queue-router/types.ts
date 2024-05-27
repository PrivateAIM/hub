/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type QueueRouterPayload = {
    id: string,
    type: string,
    data: Record<string, any>,
    metadata: {
        timestamp: number
    }
};

export type QueueRouterPayloadInput = Pick<
QueueRouterPayload,
'type'
> &
Partial<Omit<QueueRouterPayload, 'type'>>;

export type QueueRouterHandler = (message: QueueRouterPayload) => Promise<void> | void;
export type QueueRouterHandlers = {
    $any?: QueueRouterHandler,
    [key: string]: QueueRouterHandler
};
