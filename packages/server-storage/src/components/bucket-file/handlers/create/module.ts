/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type {
    BucketFileCommand,
    BucketFileComponentEventMap,
    BucketFileCreateCommandPayload,
} from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketFileEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import crypto from 'node:crypto';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import { BucketEntity, BucketFileEntity, toBucketName } from '../../../../domains';
import { BucketValidator } from '../../../../http/controllers/bucket/utils/validation';

export class BucketFileCreateHandler implements ComponentHandler<
BucketFileComponentEventMap,
BucketFileCommand.CREATE
> {
    protected validator : BucketValidator;

    constructor() {
        this.validator = new BucketValidator();
    }

    async handle(
        value: BucketFileCreateCommandPayload,
        context: ComponentHandlerContext<BucketFileComponentEventMap, BucketFileCommand.CREATE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            useLogger().error({
                message: e,
                command: BucketCommand.CREATE,
                analysis_id: value.meta.id,
                [LogFlag.REF_ID]: value.meta.id,
                [LogFlag.REF_TYPE]: DomainType.BUCKET_FILE,
            });

            await context.handle(
                BucketFileEvent.CREATION_FAILED,
                {
                    id: value.meta.id,
                    error: e,
                },
            );
        }
    }

    protected async process(
        value: BucketFileCreateCommandPayload,
        context: ComponentHandlerContext<BucketFileComponentEventMap, BucketFileCommand.CREATE>,
    ): Promise<void> {
        const { data, meta } = value;

        await context.handle(
            BucketFileEvent.CREATION_STARTED,
            meta,
        );

        // todo: validate meta

        const dataSource = await useDataSource();

        let bucket : BucketEntity;
        if (meta.bucket) {
            bucket = meta.bucket;
        } else {
            const bucketRepository = dataSource.getRepository(BucketEntity);

            bucket = await bucketRepository.findOneByOrFail({
                id: meta.bucket_id,
            });
        }

        // hash

        const hashBuilder = crypto.createHash('sha256');
        hashBuilder.update(meta.path);
        const hash = hashBuilder.digest('hex');

        // upload
        const minio = useMinio();
        await minio.putObject(
            toBucketName(bucket.id),
            hash,
            data,
            data.length,
        );

        const repository = dataSource.getRepository(BucketFileEntity);
        const entity = repository.create({
            ...meta,
            hash,
        });

        await repository.save(entity);

        await context.handle(
            BucketFileEvent.CREATION_FINISHED,
            {
                ...entity,
            },
        );
    }
}
