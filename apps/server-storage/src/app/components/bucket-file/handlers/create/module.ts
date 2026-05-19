/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type {
    BucketFileCommand,
    BucketFileComponentEventMap,
    BucketFileCreateCommandPayload,
} from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketFileEvent,
} from '@privateaim/server-storage-kit';
import { BucketValidator, DomainType  } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import crypto from 'node:crypto';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { useDataSource } from 'typeorm-extension';
import type { IStorageAdapter } from '../../../../../core/storage/types.ts';
import { BucketEntity, BucketFileEntity } from '../../../../../adapters/database/index.ts';
import { toBucketName } from '../../../../domains/bucket/utils.ts';

export class BucketFileCreateHandler implements ComponentHandler<
    BucketFileComponentEventMap,
    BucketFileCommand.CREATE
> {
    protected validator : BucketValidator;

    protected storage: IStorageAdapter;

    protected logger: Logger | undefined;

    constructor(ctx: { storage: IStorageAdapter; logger?: Logger }) {
        this.validator = new BucketValidator();
        this.storage = ctx.storage;
        this.logger = ctx.logger;
    }

    async handle(
        value: BucketFileCreateCommandPayload,
        context: ComponentHandlerContext<BucketFileComponentEventMap, BucketFileCommand.CREATE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            // Drain the source stream so the upstream parser (Busboy) can move on.
            // Idempotent if pipeline already destroyed it.
            if (!value.data.destroyed) {
                value.data.destroy();
            }

            this.logger?.error({
                message: e,
                command: BucketCommand.CREATE,
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
        const { bucket: bucketRelation, ...metaForEvent } = meta;

        await context.handle(
            BucketFileEvent.CREATION_STARTED,
            metaForEvent,
        );

        // todo: validate meta

        const dataSource = await useDataSource();

        let bucket : BucketEntity;
        if (bucketRelation) {
            bucket = bucketRelation;
        } else {
            const bucketRepository = dataSource.getRepository(BucketEntity);

            bucket = await bucketRepository.findOneByOrFail({ id: meta.bucket_id });
        }

        // Random storage key — the (bucket_id, path) DB unique constraint enforces
        // logical de-duplication, so the object key just needs to be unique per row.
        const hash = crypto.randomBytes(32).toString('hex');

        // count bytes while streaming into storage
        let size = 0;
        const counter = new Transform({
            transform(chunk: Buffer, _enc, cb) {
                size += chunk.length;
                cb(null, chunk);
            },
        });

        // Bidirectional teardown:
        //   - pipeline(data, counter) forwards source errors to counter
        //   - putObject rejection destroys counter, which causes pipeline to destroy data
        const uploadPromise = this.storage.putObject(
            toBucketName(bucket.id),
            hash,
            counter,
        ).catch((err) => {
            if (!counter.destroyed) {
                counter.destroy(err);
            }
            throw err;
        });
        await Promise.all([
            uploadPromise,
            pipeline(data, counter),
        ]);

        const repository = dataSource.getRepository(BucketFileEntity);
        const entity = repository.create({
            ...metaForEvent,
            hash,
            size,
        });

        await repository.save(entity);

        await context.handle(
            BucketFileEvent.CREATION_FINISHED,
            { ...entity },
        );
    }
}
