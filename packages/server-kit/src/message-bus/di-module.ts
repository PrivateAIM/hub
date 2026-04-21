/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { CONFIG_MODULE_NAME, ConfigInjectionKey } from '../config/constants';
import { LOGGER_MODULE_NAME, LoggerInjectionKey } from '../logger/constants';
import { MESSAGE_BUS_MODULE_NAME, MessageBusInjectionKey } from './constants';
import { AmqpMessageBusDriver } from './driver/amqp';
import { MemoryMessageBusDriver } from './driver/memory';
import type { IMessageBusDriver } from './driver/types';
import { MessageBus } from './module';

export type MessageBusModuleOptions = {
    driverFactory?: (container: IContainer) => IMessageBusDriver,
};

export class MessageBusModule implements IModule {
    readonly name = MESSAGE_BUS_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: CONFIG_MODULE_NAME, optional: true },
        { name: LOGGER_MODULE_NAME, optional: true },
    ];

    private options: MessageBusModuleOptions;

    constructor(options: MessageBusModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        let driver: IMessageBusDriver;

        if (this.options.driverFactory) {
            driver = this.options.driverFactory(container);
        } else {
            const configResult = container.tryResolve(ConfigInjectionKey);
            const connectionString = configResult.success ?
                configResult.data.rabbitMqConnectionString :
                undefined;

            if (connectionString) {
                driver = new AmqpMessageBusDriver({ connectionString });
            } else {
                driver = new MemoryMessageBusDriver();
            }
        }

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const bus = new MessageBus({
            driver,
            logger: loggerResult.success ? loggerResult.data : undefined,
        });
        container.register(MessageBusInjectionKey, { useValue: bus });
    }
}
