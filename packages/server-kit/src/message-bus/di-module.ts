/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { LOGGER_MODULE_NAME, LoggerInjectionKey } from '../logger/constants';
import { MESSAGE_BUS_MODULE_NAME, MessageBusInjectionKey } from './constants';
import type { IMessageBusDriver } from './driver/types';
import { MessageBus } from './module';

export type MessageBusModuleOptions = {
    driverFactory: (container: IContainer) => IMessageBusDriver,
};

export class MessageBusModule implements IModule {
    readonly name = MESSAGE_BUS_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: LOGGER_MODULE_NAME, optional: true },
    ];

    private options: MessageBusModuleOptions;

    constructor(options: MessageBusModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const driver = this.options.driverFactory(container);
        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const bus = new MessageBus({
            driver,
            logger: loggerResult.success ? loggerResult.data : undefined,
        });
        container.register(MessageBusInjectionKey, { useValue: bus });
    }
}
