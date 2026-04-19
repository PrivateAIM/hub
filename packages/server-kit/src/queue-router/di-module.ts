/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { AMQP_MODULE_NAME, AmqpClientInjectionKey } from '../amqp/constants';
import { LOGGER_MODULE_NAME, LoggerInjectionKey } from '../logger/constants';
import { QUEUE_ROUTER_MODULE_NAME, QueueRouterInjectionKey } from './constants';
import { QueueRouter } from './module';

export class QueueRouterModule implements IModule {
    readonly name = QUEUE_ROUTER_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        AMQP_MODULE_NAME,
        { name: LOGGER_MODULE_NAME, optional: true },
    ];

    async setup(container: IContainer): Promise<void> {
        const amqp = container.resolve(AmqpClientInjectionKey);
        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const router = new QueueRouter({
            driver: amqp,
            logger: loggerResult.success ? loggerResult.data : undefined,
        });
        container.register(QueueRouterInjectionKey, { useValue: router });
    }
}
