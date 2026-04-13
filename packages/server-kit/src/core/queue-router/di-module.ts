/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { AmqpClientInjectionKey } from '../../services/amqp/constants';
import { ModuleName } from '../../services/module-names';
import { QueueRouterInjectionKey } from './constants';
import { QueueRouter } from './module';

export class QueueRouterModule implements IModule {
    readonly name = ModuleName.QUEUE_ROUTER;

    readonly dependencies = [ModuleName.AMQP];

    async setup(container: IContainer): Promise<void> {
        const amqp = container.resolve(AmqpClientInjectionKey);
        const router = new QueueRouter(amqp);
        container.register(QueueRouterInjectionKey, { useValue: router });
    }
}
