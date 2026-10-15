/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { IComponent } from 'ergos';
import { LoggerInjectionKey, MessageBusInjectionKey } from '@privateaim/server-kit';
import { MessageBusWorkerComponentCaller } from 'ergos';
import {
    BucketEventMessageBusRouting,
    BucketFileEventMessageBusRouting,
    BucketFileTaskMessageBusRouting,
    BucketTaskMessageBusRouting,
} from '@privateaim/server-storage-kit';
import { BucketComponent } from '../../components/bucket/index.ts';
import { BucketFileComponent } from '../../components/bucket-file/index.ts';
import { StorageInjectionKey } from '../storage/constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['storage', 'database'];

    protected components: IComponent<any>[] = [];

    async setup(container: IContainer): Promise<void> {
        const storage = container.resolve(StorageInjectionKey);

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;
        const messageBusResult = container.tryResolve(MessageBusInjectionKey);
        const messageBus = messageBusResult.success ? messageBusResult.data : undefined;

        this.components = [
            new MessageBusWorkerComponentCaller(new BucketComponent({ storage, logger }), {
                consumeRouting: BucketTaskMessageBusRouting,
                publishRouting: BucketEventMessageBusRouting,
                messageBus,
                logger,
            }),
            new MessageBusWorkerComponentCaller(new BucketFileComponent({ storage, logger }), {
                consumeRouting: BucketFileTaskMessageBusRouting,
                publishRouting: BucketFileEventMessageBusRouting,
                messageBus,
                logger,
            }),
        ];

        await Promise.all(this.components.map((c) => c.start()));
    }

    async teardown(): Promise<void> {
        const { components } = this;
        this.components = [];

        await Promise.all(components.map((c) => c.stop()));
    }
}
