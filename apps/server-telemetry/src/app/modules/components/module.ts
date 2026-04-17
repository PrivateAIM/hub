/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller } from '@privateaim/server-kit';
import {
    EventEventQueueRouterRouting,
    EventTaskQueueRouterRouting,
    LogEventQueueRouterRouting,
    LogTaskQueueRouterRouting,
} from '@privateaim/server-telemetry-kit';
import type { LogStore } from '../../../core/services/log-store/types.ts';
import { EventComponent } from '../../components/event/index.ts';
import { LogComponent } from '../../components/log/index.ts';
import { LogStoreInjectionKey } from '../victoria-logs/constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database', 'victoriaLogs'];

    async setup(container: IContainer): Promise<void> {
        let logStore: LogStore | undefined;
        const logStoreResult = container.tryResolve(LogStoreInjectionKey);
        if (logStoreResult.success) {
            logStore = logStoreResult.data;
        }

        const components : Component<any>[] = [
            new QueueWorkerComponentCaller(
                new EventComponent(),
                {
                    consumeQueue: EventTaskQueueRouterRouting,
                    publishQueue: EventEventQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new LogComponent({ logStore }),
                {
                    consumeQueue: LogTaskQueueRouterRouting,
                    publishQueue: LogEventQueueRouterRouting,
                },
            ),
        ];

        const promises = components.map((c) => c.start());
        await Promise.all(promises);
    }
}
