/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { AmqpClientInjectionKey } from '../../services/amqp/constants';
import { LoggerInjectionKey } from '../../services/logger/constants';
import { ModuleName } from '../../services/module-names';
import { QueueRouterInjectionKey } from './constants';
import { QueueRouter } from './module';

export class QueueRouterModule implements IModule {
    readonly name = ModuleName.QUEUE_ROUTER;

    readonly dependencies: (string | ModuleDependency)[] = [
        ModuleName.AMQP,
        { name: ModuleName.LOGGER, optional: true },
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
