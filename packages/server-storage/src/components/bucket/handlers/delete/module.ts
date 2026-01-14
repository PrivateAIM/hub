/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketDeleteCommandPayload } from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core/index.ts';
import { BucketEntity } from '../../../../database/index.ts';
import { toBucketName } from '../../../../domains/index.ts';

export class BucketDeleteHandler implements ComponentHandler<
BucketComponentEventMap,
BucketCommand.DELETE
> {
    async handle(
        value: BucketDeleteCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.DELETE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            useLogger().error({
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
        const entity = await repository.findOneBy({
            id: value.id,
        });

        if (!entity) {
            throw new NotFoundError();
        }

        const entityId = entity.id;

        await repository.remove(entity);

        const minio = useMinio();
        await minio.removeBucket(toBucketName(entityId));

        await context.handle(
            BucketEvent.DELETION_FINISHED,
            {
                ...entity,
                id: entityId,
            },
        );
    }
}
