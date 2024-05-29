/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { isAmqpClientUsable, useAmqpClient } from '../../services';
import { QueueRouter } from './module';

const instance = singa<QueueRouter>({
    name: 'queueRouter',
    factory: () => {
        const amqp = useAmqpClient();

        return new QueueRouter(amqp);
    },
});

export function isQueueRouterUsable() {
    return instance.has() || isAmqpClientUsable();
}

export function useQueueRouter() {
    return instance.use();
}
