/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { BucketCreateCommandPayload } from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketEvent,
    BucketEventQueueRouterRouting,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import { BucketEntity, toBucketName } from '../../../../domains';
import { BucketValidator } from '../../../../http/controllers/bucket/utils/validation';

export class BucketCreateHandler implements ComponentHandler<
BucketCommand.CREATE,
BucketCreateCommandPayload> {
    protected validator : BucketValidator;

    constructor() {
        this.validator = new BucketValidator();
    }

    async handle(value: BucketCreateCommandPayload, context: ComponentHandlerContext): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            useLogger().error({
                message: e,
                command: BucketCommand.CREATE,
                analysis_id: value.id,
                [LogFlag.REF_ID]: value.id,
                [LogFlag.REF_TYPE]: DomainType.BUCKET,
            });

            await context.emit(
                BucketEvent.CREATION_FAILED,
                {
                    ...value,
                    error: e,
                },
                {
                    ...context.metadata,
                    routing: BucketEventQueueRouterRouting,
                },
            );
        }
    }

    protected async process(value: BucketCreateCommandPayload, context: ComponentHandlerContext): Promise<void> {
        await context.emit(
            BucketEvent.CREATION_STARTED,
            value,
            {
                ...context.metadata,
                routing: BucketEventQueueRouterRouting,
            },
        );

        const data = await this.validator.run(value);

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(BucketEntity);
        const entity = repository.create(data);

        await repository.save(entity);

        const minio = useMinio();
        if (entity.region) {
            await minio.makeBucket(toBucketName(entity.id), entity.region);
        } else {
            await minio.makeBucket(toBucketName(entity.id));
        }

        await context.emit(
            BucketEvent.CREATION_FINISHED,
            {
                ...entity,
            },
            {
                ...context.metadata,
                routing: BucketEventQueueRouterRouting,
            },
        );
    }
}
