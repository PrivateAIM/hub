/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IMessageBus, IMessageBusDriver } from 'hubwire';
import { MemoryMessageBusDriver, MessageBus } from 'hubwire';
import { AmqpMessageBusDriver } from '@hubwire/amqp';
import type { IModule, ModuleDependency } from 'orkos';
import { CONFIG_MODULE_NAME, ConfigInjectionKey } from '../config/constants';
import { LOGGER_MODULE_NAME, LoggerInjectionKey } from '../logger/constants';
import { createAmqpDriverLogHooks, createMessageBusLogHooks } from './hooks';
import {
    MESSAGE_BUS_MAX_ATTEMPTS,
    MESSAGE_BUS_MODULE_NAME,
    MESSAGE_BUS_TOPIC_EXCHANGE,
    MessageBusInjectionKey,
    RemoteMessageBusInjectionKey,
} from './constants';
import type { MessageBusModuleOptions } from './types';

/**
 * Always registers a bus: over AMQP when a connection string is configured,
 * otherwise in-process (memory driver), so callers can depend on one. Only a
 * bus whose driver is not the memory driver is also registered as
 * `RemoteMessageBusInjectionKey`.
 */
export class MessageBusModule implements IModule {
    readonly name = MESSAGE_BUS_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: CONFIG_MODULE_NAME, optional: true },
        { name: LOGGER_MODULE_NAME, optional: true },
    ];

    private options: MessageBusModuleOptions;

    private messageBus: IMessageBus | undefined;

    constructor(options: MessageBusModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;

        let driver: IMessageBusDriver;

        if (this.options.driverFactory) {
            driver = this.options.driverFactory(container);
        } else {
            const configResult = container.tryResolve(ConfigInjectionKey);
            const connectionString = configResult.success ?
                configResult.data.rabbitMqConnectionString :
                undefined;

            if (connectionString) {
                driver = new AmqpMessageBusDriver({
                    connectionString,
                    hooks: logger ? createAmqpDriverLogHooks(logger) : undefined,
                    defaultTopicExchange: MESSAGE_BUS_TOPIC_EXCHANGE,
                    maxAttempts: MESSAGE_BUS_MAX_ATTEMPTS,
                });
            } else {
                driver = new MemoryMessageBusDriver();
            }
        }

        const bus = new MessageBus({
            driver,
            hooks: logger ?
                createMessageBusLogHooks(logger, { silentRoutings: this.options.silentRoutings }) :
                undefined,
        });

        this.messageBus = bus;
        container.register(MessageBusInjectionKey, { useValue: bus });

        if (!(driver instanceof MemoryMessageBusDriver)) {
            container.register(RemoteMessageBusInjectionKey, { useValue: bus });
        }
    }

    async teardown(): Promise<void> {
        const { messageBus } = this;

        this.messageBus = undefined;
        await messageBus?.close();
    }
}
