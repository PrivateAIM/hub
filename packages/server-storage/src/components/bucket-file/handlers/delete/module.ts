/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type {
    BucketFileComponentEventMap,
    BucketFileDeleteCommandPayload,
} from '@privateaim/server-storage-kit';
import {
    BucketEvent,
    BucketFileCommand,
    BucketFileEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import { BucketFileEntity } from '../../../../database';

export class BucketFileDeleteHandler implements ComponentHandler<
BucketFileComponentEventMap,
BucketFileCommand.DELETE
> {
    async handle(
        value: BucketFileDeleteCommandPayload,
        context: ComponentHandlerContext<BucketFileComponentEventMap, BucketFileCommand.DELETE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            useLogger().error({
                message: e,
                command: BucketFileCommand.DELETE,
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
        value: BucketFileDeleteCommandPayload,
        context: ComponentHandlerContext<BucketFileComponentEventMap, BucketFileCommand.DELETE>,
    ): Promise<void> {
        await context.handle(
            BucketFileEvent.DELETION_STARTED,
            value,
        );

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(BucketFileEntity);
        const entity = await repository.findOneBy({
            id: value.id,
        });

        if (!entity) {
            throw new NotFoundError();
        }

        const entityId = entity.id;

        await repository.remove(entity);

        // todo: delete minio file

        await context.handle(
            BucketFileEvent.DELETION_FINISHED,
            {
                ...entity,
                id: entityId,
            },
        );
    }
}
