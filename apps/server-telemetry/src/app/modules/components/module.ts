/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { IComponent } from 'hubwire';
import {
    LoggerInjectionKey,
    MESSAGE_BUS_MODULE_NAME,
    MessageBusInjectionKey,
    createRemoteWorkerLogHooks,
} from '@privateaim/server-kit';
import { RemoteWorker } from 'hubwire';
import {
    EventTaskMessageBusRouting,
    LogTaskMessageBusRouting,
} from '@privateaim/server-telemetry-kit';
import type { LogStore } from '../../../core/services/log-store/types.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { EventComponent } from '../../components/event/index.ts';
import { createEventCleanerComponent } from '../../components/event-cleaner/index.ts';
import { LogComponent } from '../../components/log/index.ts';
import { LogStoreInjectionKey } from '../victoria-logs/constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['config', 'database', 'victoriaLogs', MESSAGE_BUS_MODULE_NAME];

    protected components: IComponent<any>[] = [];

    async setup(container: IContainer): Promise<void> {
        let logStore: LogStore | undefined;
        const logStoreResult = container.tryResolve(LogStoreInjectionKey);

        if (logStoreResult.success) {
            logStore = logStoreResult.data;
        }

        // hard resolve: `database` is a declared dependency, so a missing
        // repository is a wiring bug rather than an optional feature.
        const eventRepository = container.resolve(DatabaseInjectionKey.EventRepository);
        const config = container.resolve(ConfigInjectionKey);

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;
        const messageBus = container.resolve(MessageBusInjectionKey);
        const hooks = logger ? createRemoteWorkerLogHooks(logger) : undefined;

        this.components = [
            new RemoteWorker(
                new EventComponent({ logger, retentionDays: config.eventRetentionDays }),
                {
                    consume: EventTaskMessageBusRouting,
                    messageBus,
                    hooks,
                },
            ),
            new RemoteWorker(
                new LogComponent({ logStore, logger }),
                {
                    consume: LogTaskMessageBusRouting,
                    messageBus,
                    hooks,
                },
            ),
            createEventCleanerComponent({ repository: eventRepository, logger }),
        ];

        await Promise.all(this.components.map((c) => c.start()));
    }

    async teardown(): Promise<void> {
        const { components } = this;

        this.components = [];

        await Promise.all(components.map((c) => c.stop()));
        // stop() never waits for a cleaner pass in flight; it must finish before the database closes.
        await Promise.all(components.map((c) => c.settled?.()));
    }
}
