/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type { BucketClearCommandPayload, BucketComponentEventMap } from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import type { IStorageAdapter } from '../../../../../core/storage/types.ts';
import { BucketEntity, BucketFileEntity } from '../../../../../adapters/database/index.ts';
import { toBucketName } from '../../../../domains/bucket/utils.ts';

/**
 * Empties a bucket — every stored object and every bucket-file row — while
 * keeping the bucket itself, so it can be filled again (e.g. an analysis'
 * TEMP bucket on re-run).
 */
export class BucketClearHandler implements ComponentHandler<
    BucketComponentEventMap,
    BucketCommand.CLEAR
> {
    protected storage: IStorageAdapter;

    protected logger: Logger | undefined;

    constructor(ctx: { storage: IStorageAdapter; logger?: Logger }) {
        this.storage = ctx.storage;
        this.logger = ctx.logger;
    }

    async handle(
        value: BucketClearCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CLEAR>,
    ): Promise<void> {
        try {
            await this.process(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: BucketCommand.CLEAR,
                [LogFlag.REF_ID]: value.id,
                [LogFlag.REF_TYPE]: DomainType.BUCKET,
            });

            await context.handle(
                BucketEvent.CLEARING_FAILED,
                {
                    ...value,
                    error: e,
                },
            );

            // clear is idempotent: rethrow so the bus retries a transient failure
            // (bounded, plan 018); a missing bucket stays missing, so no retry.
            if (!(e instanceof EntityNotFoundError)) {
                throw e;
            }
        }
    }

    protected async process(
        value: BucketClearCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CLEAR>,
    ): Promise<void> {
        await context.handle(
            BucketEvent.CLEARING_STARTED,
            value,
        );

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(BucketEntity);
        const entity = await repository.findOneBy({ id: value.id });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        // ponytail: the file rows are the one snapshot of what to clear — each row's
        // hash is its object key (as the bucket-file delete handler uses it), so
        // objects without a row (orphans) are no longer swept. Accepted ceiling:
        // there is no cutoff timestamp, so a CLEAR still queued when a re-run starts
        // uploading also removes those new files; add a cutoff if re-runs ever start
        // within queue latency.
        const fileRepository = dataSource.getRepository(BucketFileEntity);
        const files = await fileRepository.findBy({ bucketId: entity.id });
        // captured before remove(), which unsets the ids
        const fileIds = files.map((file) => file.id);

        const bucketName = toBucketName(entity.id);
        if (files.length > 0 && await this.storage.bucketExists(bucketName)) {
            await this.storage.removeObjects(bucketName, files.map((file) => file.hash));
        }

        // remove() rather than a raw delete, so the subscriber publishes a domain event per file
        if (files.length > 0) {
            await fileRepository.remove(files);
        }

        await context.handle(
            BucketEvent.CLEARING_FINISHED,
            { ...entity, fileIds },
        );
    }
}
