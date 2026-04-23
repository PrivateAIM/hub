/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketCreateCommandPayload } from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import type { Client } from 'minio';
import { BucketEntity } from '../../../../../adapters/database/index.ts';
import { toBucketName } from '../../../../domains/bucket/utils.ts';
import { ValidatorGroup } from '@privateaim/server-kit';
import { BucketValidator } from '../../../../../core/entities/index.ts';

export class BucketCreateHandler implements ComponentHandler<
    BucketComponentEventMap,
    BucketCommand.CREATE
> {
    protected validator : BucketValidator;

    protected minio: Client;

    protected logger: Logger | undefined;

    constructor(ctx: { minio: Client; logger?: Logger }) {
        this.validator = new BucketValidator();
        this.minio = ctx.minio;
        this.logger = ctx.logger;
    }

    async handle(
        value: BucketCreateCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CREATE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            this.logger?.error({
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

        const data = await this.validator.run(value, { group: ValidatorGroup.CREATE });

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(BucketEntity);
        const entity = repository.create(data);

        await repository.save(entity);

        if (entity.region) {
            await this.minio.makeBucket(toBucketName(entity.id), entity.region);
        } else {
            await this.minio.makeBucket(toBucketName(entity.id));
        }

        await context.handle(
            BucketEvent.CREATION_FINISHED,
            { ...entity },
        );
    }
}
