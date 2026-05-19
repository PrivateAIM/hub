/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketDeleteCommandPayload } from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import type { IStorageAdapter } from '../../../../../core/storage/types.ts';
import { BucketEntity } from '../../../../../adapters/database/index.ts';
import { toBucketName } from '../../../../domains/bucket/utils.ts';

export class BucketDeleteHandler implements ComponentHandler<
    BucketComponentEventMap,
    BucketCommand.DELETE
> {
    protected storage: IStorageAdapter;

    protected logger: Logger | undefined;

    constructor(ctx: { storage: IStorageAdapter; logger?: Logger }) {
        this.storage = ctx.storage;
        this.logger = ctx.logger;
    }

    async handle(
        value: BucketDeleteCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.DELETE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: BucketCommand.DELETE,
                analysis_id: value.id,
                [LogFlag.REF_ID]: value.id,
                [LogFlag.REF_TYPE]: DomainType.BUCKET,
            });

            await context.handle(
                BucketEvent.DELETION_FAILED,
                {
                    ...value,
                    error: e,
                },
            );
        }
    }

    protected async process(
        value: BucketDeleteCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.DELETE>,
    ): Promise<void> {
        await context.handle(
            BucketEvent.DELETION_STARTED,
            value,
        );

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(BucketEntity);
        const entity = await repository.findOneBy({ id: value.id });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        const entityId = entity.id;
        const bucketName = toBucketName(entityId);
        const exists = await this.storage.bucketExists(bucketName);

        if (exists) {
            const objects = await this.storage.listObjects(bucketName);
            if (objects.length > 0) {
                await this.storage.removeObjects(bucketName, objects);
            }

            await this.storage.removeBucket(bucketName);
        }

        await repository.remove(entity);

        await context.handle(
            BucketEvent.DELETION_FINISHED,
            {
                ...entity,
                id: entityId,
            },
        );
    }
}
