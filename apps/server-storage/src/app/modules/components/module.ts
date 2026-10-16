/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { IComponent } from 'synergos';
import {
    LoggerInjectionKey,
    MESSAGE_BUS_MODULE_NAME,
    MessageBusInjectionKey,
    createWorkerCallerLogHooks,
} from '@privateaim/server-kit';
import { WorkerCaller } from 'synergos';
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

    readonly dependencies: string[] = ['storage', 'database', MESSAGE_BUS_MODULE_NAME];

    protected components: IComponent<any>[] = [];

    async setup(container: IContainer): Promise<void> {
        const storage = container.resolve(StorageInjectionKey);

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;
        const messageBus = container.resolve(MessageBusInjectionKey);
        const hooks = logger ? createWorkerCallerLogHooks(logger) : undefined;

        this.components = [
            new WorkerCaller(new BucketComponent({ storage, logger }), {
                consumeRouting: BucketTaskMessageBusRouting,
                publishRouting: BucketEventMessageBusRouting,
                messageBus,
                hooks,
            }),
            new WorkerCaller(new BucketFileComponent({ storage, logger }), {
                consumeRouting: BucketFileTaskMessageBusRouting,
                publishRouting: BucketFileEventMessageBusRouting,
                messageBus,
                hooks,
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
