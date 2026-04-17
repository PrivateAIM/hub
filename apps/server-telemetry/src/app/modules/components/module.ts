/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IModule } from 'orkos';
import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller } from '@privateaim/server-kit';
import {
    EventEventQueueRouterRouting,
    EventTaskQueueRouterRouting,
    LogEventQueueRouterRouting,
    LogTaskQueueRouterRouting,
} from '@privateaim/server-telemetry-kit';
import { EventComponent } from '../../components/event/index.ts';
import { LogComponent } from '../../components/log/index.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database'];

    async setup(): Promise<void> {
        const components : Component<any>[] = [
            new QueueWorkerComponentCaller(
                new EventComponent(),
                {
                    consumeQueue: EventTaskQueueRouterRouting,
                    publishQueue: EventEventQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new LogComponent(),
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
