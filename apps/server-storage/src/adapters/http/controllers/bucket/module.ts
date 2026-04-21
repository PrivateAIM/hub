/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { BucketFileEventCaller } from '@privateaim/server-storage-kit';
import {
    DBody,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { Request, Response } from 'routup';
import type { Client } from 'minio';
import type { IBucketFileRepository, IBucketService } from '../../../../core/entities/index.ts';
import { toBucketName } from '../../../../core/utils/bucket-name.ts';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import { buildActorContext } from '../../request/index.ts';
import { uploadRequestFilesToBucket } from './upload.ts';
import { packBucketFiles } from './stream.ts';

type BucketControllerContext = {
    service: IBucketService;
    bucketFileRepository: IBucketFileRepository;
    minio: Client;
    bucketFileComponent: BucketFileComponent;
    bucketFileEventCaller: BucketFileEventCaller;
    logger?: Logger;
};

@DTags('buckets')
@DController('/buckets')
export class BucketController {
    protected service: IBucketService;

    protected bucketFileRepository: IBucketFileRepository;

    protected minio: Client;

    protected bucketFileComponent: BucketFileComponent;

    protected bucketFileEventCaller: BucketFileEventCaller;

    protected logger: Logger | undefined;

    constructor(ctx: BucketControllerContext) {
        this.service = ctx.service;
        this.bucketFileRepository = ctx.bucketFileRepository;
        this.minio = ctx.minio;
        this.bucketFileComponent = ctx.bucketFileComponent;
        this.bucketFileEventCaller = ctx.bucketFileEventCaller;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const entity = await this.service.getOne(id);

        const files = await this.bucketFileRepository.findManyBy({ bucket_id: entity.id });

        res.writeHead(200, {
            'Content-Type': 'application/x-tar',
            'Transfer-Encoding': 'chunked',
        });

        const bucketName = toBucketName(entity.id);

        this.logger?.debug(`Streaming files of ${bucketName}`);

        try {
            await packBucketFiles(res, bucketName, files, this.minio, this.logger);

            this.logger?.debug(`Streamed files of ${bucketName}`);
        } catch (err) {
            this.logger?.error(err);

            if (!res.writableEnded) {
                res.destroy(err instanceof Error ? err : undefined);
            }
        }
    }

    @DPost('/:id/upload', [ForceLoggedInMiddleware])
    async upload(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const entity = await this.service.getOne(id);

        const files = await uploadRequestFilesToBucket(req, entity, this.bucketFileComponent, this.bucketFileEventCaller);

        res.statusCode = 201;
        return {
            data: files,
            meta: { total: files.length },
        };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
    ) {
        const query = useRequestQuery(req);
        return this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
        @DBody() data: any,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const actor = buildActorContext(req);
        const entity = await this.service.update(id, data, actor);
        res.statusCode = 202;
        return entity;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        res.statusCode = 201;
        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        res.statusCode = 202;
        return entity;
    }
}
