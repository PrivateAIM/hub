/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Bucket,
    BucketCreatePayload,
    EntityCollectionResponse,
    EntityRecordResponse,
} from '@privateaim/storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import type { Logger } from '@privateaim/server-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
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
import type { IAppEvent } from 'routup';
import {
    sendStream,
    setResponseHeaderAttachment,
    setResponseHeaderContentType,
} from 'routup';
import type { IStorageAdapter } from '../../../../core/storage/types.ts';
import type { IBucketFileRepository, IBucketService } from '../../../../core/entities/index.ts';
import { bucketSchema } from '../../../../core/entities/index.ts';
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
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<Bucket>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);

        return { data, meta: { ...meta, schema: describeQuerySchema(bucketSchema) } };
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ) {
        const entity = await this.service.getOne(id);

        const files = await this.bucketFileRepository.findManyBy({ bucketId: entity.id });

        const bucketName = toBucketName(entity.id);

        this.logger?.debug(`Streaming files of bucket ${entity.name}`, {
            [LogFlag.REF_TYPE]: DomainType.BUCKET,
            [LogFlag.REF_ID]: entity.id,
        });

        const stream = packBucketFiles(bucketName, files, this.storage, this.logger);

        setResponseHeaderAttachment(event, `${bucketName}.tar`);
        setResponseHeaderContentType(event, 'application/x-tar');

        return sendStream(event, stream);
    }

    @DPost('/:id/upload', [ForceLoggedInMiddleware])
    async upload(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
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
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Bucket>> {
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);

        return {
            data: entity,
            meta: { schema: describeQuerySchema(bucketSchema, RECORD_QUERY_PARAMETERS) },
        };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
        @DBody() data: Partial<BucketCreatePayload>,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Bucket>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: BucketCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Bucket>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Bucket>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
