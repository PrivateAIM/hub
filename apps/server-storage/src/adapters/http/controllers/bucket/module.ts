/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket, BucketCreatePayload } from '@privateaim/storage-kit';
import type { Logger } from '@privateaim/server-kit';
import type { BucketFileEventCaller } from '@privateaim/server-storage-kit';
import {
    DBody,
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IRoutupEvent } from 'routup';
import type { IStorageAdapter } from '../../../../core/storage/types.ts';
import type { IBucketFileRepository, IBucketService } from '../../../../core/entities/index.ts';
import { toBucketName } from '../../../../core/utils/bucket-name.ts';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import { buildActorContext } from '../../request/index.ts';
import { uploadRequestFilesToBucket } from './upload.ts';
import { packBucketFiles } from './stream.ts';

type BucketControllerContext = {
    service: IBucketService;
    bucketFileRepository: IBucketFileRepository;
    storage: IStorageAdapter;
    bucketFileComponent: BucketFileComponent;
    bucketFileEventCaller: BucketFileEventCaller;
    logger?: Logger;
};

@DTags('buckets')
@DController('/buckets')
export class BucketController {
    protected service: IBucketService;

    protected bucketFileRepository: IBucketFileRepository;

    protected storage: IStorageAdapter;

    protected bucketFileComponent: BucketFileComponent;

    protected bucketFileEventCaller: BucketFileEventCaller;

    protected logger: Logger | undefined;

    constructor(ctx: BucketControllerContext) {
        this.service = ctx.service;
        this.bucketFileRepository = ctx.bucketFileRepository;
        this.storage = ctx.storage;
        this.bucketFileComponent = ctx.bucketFileComponent;
        this.bucketFileEventCaller = ctx.bucketFileEventCaller;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IRoutupEvent,
    ) {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
    ) {
        const entity = await this.service.getOne(id);

        const files = await this.bucketFileRepository.findManyBy({ bucket_id: entity.id });

        const bucketName = toBucketName(entity.id);

        this.logger?.debug(`Streaming files of ${bucketName}`);

        try {
            const response = await packBucketFiles(bucketName, files, this.storage, this.logger);

            this.logger?.debug(`Streamed files of ${bucketName}`);

            return response;
        } catch (err) {
            this.logger?.error(err);

            throw err;
        }
    }

    @DPost('/:id/upload', [ForceLoggedInMiddleware])
    async upload(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ) {
        const entity = await this.service.getOne(id);

        const files = await uploadRequestFilesToBucket(event, entity, this.bucketFileComponent, this.bucketFileEventCaller);

        event.response.status = 201;
        return {
            data: files,
            meta: { total: files.length },
        };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<Bucket> {
        const query = useRequestQuery(event);
        return this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
        @DBody() data: Partial<BucketCreatePayload>,
        @DContext() event: IRoutupEvent,
    ): Promise<Bucket> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return entity;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: BucketCreatePayload,
        @DContext() event: IRoutupEvent,
    ): Promise<Bucket> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<Bucket> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
