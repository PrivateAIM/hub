/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketCreateCommandPayload } from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import { useMinio } from '../../../../core';
import { BucketEntity } from '../../../../database';
import { toBucketName } from '../../../../domains';
import { BucketValidator } from '../../../../http/controllers/bucket/utils/validation';

export class BucketCreateHandler implements ComponentHandler<
BucketComponentEventMap,
BucketCommand.CREATE
> {
    protected validator : BucketValidator;

    constructor() {
        this.validator = new BucketValidator();
    }

    async handle(
        value: BucketCreateCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CREATE>,
    ): Promise<void> {
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

            await context.handle(
                BucketEvent.CREATION_FAILED,
                {
                    id: value.id,
                    error: e,
                },
            );
        }
    }

    protected async process(
        value: BucketCreateCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CREATE>,
    ): Promise<void> {
        await context.handle(
            BucketEvent.CREATION_STARTED,
            value,
        );

        const data = await this.validator.run(value, {
            group: HTTPHandlerOperation.CREATE,
        });

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

        await context.handle(
            BucketEvent.CREATION_FINISHED,
            {
                ...entity,
            },
        );
    }
}
