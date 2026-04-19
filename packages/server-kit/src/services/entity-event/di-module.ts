/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency  } from 'orkos';
import { LoggerInjectionKey } from '../logger/constants';
import { ModuleName } from '../module-names';
import { EntityEventPublisherInjectionKey } from './constants';
import { EntityEventPublisher } from './module';
import type { IEntityEventHandler } from './types';

export type EntityEventModuleOptions = {
    handlers?: IEntityEventHandler[];
    handlerFactory?: (container: IContainer) => IEntityEventHandler[];
};

export class EntityEventModule implements IModule {
    readonly name = ModuleName.ENTITY_EVENT;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: ModuleName.REDIS, optional: true },
        { name: ModuleName.LOGGER, optional: true },
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
