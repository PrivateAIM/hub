/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type {
    BucketFileComponentEventMap,
    BucketFileDeleteCommandPayload,
} from '@privateaim/server-storage-kit';
import {
    BucketFileCommand,
    BucketFileEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import type { IStorageAdapter } from '../../../../../core/storage/types.ts';
import { BucketFileEntity } from '../../../../../adapters/database/index.ts';
import { toBucketName } from '../../../../domains/bucket/utils.ts';

export class BucketFileDeleteHandler implements ComponentHandler<
    BucketFileComponentEventMap,
    BucketFileCommand.DELETE
> {
    protected storage: IStorageAdapter;

    protected logger: Logger | undefined;

    constructor(ctx: { storage: IStorageAdapter; logger?: Logger }) {
        this.storage = ctx.storage;
        this.logger = ctx.logger;
    }

    async handle(
        value: BucketFileDeleteCommandPayload,
        context: ComponentHandlerContext<BucketFileComponentEventMap, BucketFileCommand.DELETE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: BucketFileCommand.DELETE,
                analysis_id: value.id,
                [LogFlag.REF_ID]: value.id,
                [LogFlag.REF_TYPE]: DomainType.BUCKET_FILE,
            });

            await context.handle(
                BucketFileEvent.DELETION_FAILED,
                {
                    ...value,
                    error: e,
                },
            );
        }
    }

    protected async process(
        value: BucketFileDeleteCommandPayload,
        context: ComponentHandlerContext<BucketFileComponentEventMap, BucketFileCommand.DELETE>,
    ): Promise<void> {
        await context.handle(
            BucketFileEvent.DELETION_STARTED,
            value,
        );

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(BucketFileEntity);
        const entity = await repository.findOne({
            where: { id: value.id },
            relations: ['bucket'],
        });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket-file' });
        }

        const bucketName = toBucketName(entity.bucket.id);
        const bucketExists = await this.storage.bucketExists(bucketName);

        if (bucketExists) {
            await this.storage.removeObject(bucketName, entity.hash);
        }

        const entityId = entity.id;

        await repository.remove(entity);

        await context.handle(
            BucketFileEvent.DELETION_FINISHED,
            {
                ...entity,
                id: entityId,
            },
        );
    }
}
