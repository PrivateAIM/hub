/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency  } from 'orkos';
import { LOGGER_MODULE_NAME, LoggerInjectionKey } from '../logger/constants';
import { REDIS_MODULE_NAME } from '../redis/constants';
import { ENTITY_EVENT_MODULE_NAME, EntityEventPublisherInjectionKey } from './constants';
import { EntityEventPublisher } from './module';
import type { IEntityEventHandler } from './types';

export type EntityEventModuleOptions = {
    handlers?: IEntityEventHandler[];
    handlerFactory?: (container: IContainer) => IEntityEventHandler[];
};

export class EntityEventModule implements IModule {
    readonly name = ENTITY_EVENT_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: REDIS_MODULE_NAME, optional: true },
        { name: LOGGER_MODULE_NAME, optional: true },
    ];

    private options: EntityEventModuleOptions;

    constructor(options: EntityEventModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const publisher = new EntityEventPublisher({ logger: loggerResult.success ? loggerResult.data : undefined });

        if (this.options.handlerFactory) {
            const handlers = this.options.handlerFactory(container);
            for (const handler of handlers) {
                publisher.register(handler);
            }
        }

        if (this.options.handlers) {
            for (const handler of this.options.handlers) {
                publisher.register(handler);
            }
        }

        container.register(EntityEventPublisherInjectionKey, { useValue: publisher });
    }
}
