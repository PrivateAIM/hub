/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { LoggerInjectionKey, RemoteMessageBusInjectionKey } from '@privateaim/server-kit';
import { RemoteDispatcher } from 'hubwire';
import { BucketEventMessageBusRouting, BucketFileEventDispatcher } from '@privateaim/server-storage-kit';
import { BucketController } from '../../../adapters/http/controllers/bucket/module.ts';
import { BucketFileController } from '../../../adapters/http/controllers/bucket-file/module.ts';
import { RootController } from '../../../adapters/http/controllers/root/index.ts';
import { BucketService } from '../../../core/entities/bucket/service.ts';
import { BucketFileService } from '../../../core/entities/bucket-file/service.ts';
import { BucketComponent } from '../../components/bucket/module.ts';
import { BucketFileComponent } from '../../components/bucket-file/module.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { StorageInjectionKey } from '../storage/constants.ts';
import { BucketDispatcherAdapter } from './dispatchers/bucket-dispatcher.ts';
import { BucketFileDispatcherAdapter } from './dispatchers/bucket-file-dispatcher.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    const bucketRepository = container.resolve(DatabaseInjectionKey.BucketRepository);
    const bucketFileRepository = container.resolve(DatabaseInjectionKey.BucketFileRepository);
    const storage = container.resolve(StorageInjectionKey);

    const loggerResult = container.tryResolve(LoggerInjectionKey);
    const logger = loggerResult.success ? loggerResult.data : undefined;

    // only over AMQP: server-core consumes bucket and file events, nothing in-process does
    const messageBusResult = container.tryResolve(RemoteMessageBusInjectionKey);
    const messageBus = messageBusResult.success ? messageBusResult.data : undefined;

    const bucketComponent = new BucketComponent({ storage, logger });
    const bucketFileComponent = new BucketFileComponent({ storage, logger });
    const bucketFileEventDispatcher = messageBus ? new BucketFileEventDispatcher({ messageBus }) : undefined;

    const bucketDispatcher = new BucketDispatcherAdapter(
        bucketComponent,
        messageBus ?
            new RemoteDispatcher({ messageBus, routing: BucketEventMessageBusRouting }) :
            undefined,
    );
    const bucketFileDispatcher = new BucketFileDispatcherAdapter(bucketFileComponent, bucketFileEventDispatcher);

    const bucketService = new BucketService({
        repository: bucketRepository,
        dispatcher: bucketDispatcher,
        storage,
    });

    const bucketFileService = new BucketFileService({
        repository: bucketFileRepository,
        dispatcher: bucketFileDispatcher,
    });

    return [
        new BucketController({
            service: bucketService,
            bucketFileRepository,
            storage,
            bucketFileComponent,
            bucketFileEventDispatcher,
            logger,
        }),
        new BucketFileController({
            service: bucketFileService,
            bucketFileRepository,
            storage,
            logger,
        }),
        new RootController(),
    ];
}
