/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { Bucket } from '@privateaim/storage-kit';
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
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { BucketFileEventCaller } from '@privateaim/server-storage-kit';
import type { DataSource } from 'typeorm';
import type { Client } from 'minio';
import type { Request, Response } from 'routup';
import type { BucketComponent } from '../../../../app/components/bucket/module.ts';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import {
    executeBucketRouteCreateHandler,
    executeBucketRouteDeleteHandler,
    executeBucketRouteGetManyHandler,
    executeBucketRouteGetOneHandler,
    executeBucketRouteStreamHandler,
    executeBucketRouteUpdateHandler,
    executeBucketRouteUploadHandler,
} from './handlers/index.ts';

type BucketCreate = Pick<Bucket, 'name' | 'region'>;
type BucketUpdate = BucketCreate;

@DTags('buckets')
@DController('/buckets')
export class BucketController {
    private dataSource: DataSource;

    private minio: Client;

    private bucketComponent: BucketComponent;

    private bucketFileComponent: BucketFileComponent;

    private bucketFileEventCaller: BucketFileEventCaller;

    private logger: Logger | undefined;

    constructor(ctx: {
        dataSource: DataSource;
        minio: Client;
        bucketComponent: BucketComponent;
        bucketFileComponent: BucketFileComponent;
        bucketFileEventCaller: BucketFileEventCaller;
        logger?: Logger;
    }) {
        this.dataSource = ctx.dataSource;
        this.minio = ctx.minio;
        this.bucketComponent = ctx.bucketComponent;
        this.bucketFileComponent = ctx.bucketFileComponent;
        this.bucketFileEventCaller = ctx.bucketFileEventCaller;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketRouteGetManyHandler(req, res, this.dataSource);
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketRouteStreamHandler(req, res, this.dataSource, this.minio, this.logger);
    }

    @DPost('/:id/upload', [ForceLoggedInMiddleware])
    async upload(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketRouteUploadHandler(
            req,
            res,
            this.dataSource,
            this.bucketFileComponent,
            this.bucketFileEventCaller,
        );
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketRouteGetOneHandler(req, res, this.dataSource);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
        @DBody() data: BucketUpdate,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketRouteUpdateHandler(req, res, this.dataSource, this.minio);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: BucketCreate,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketRouteCreateHandler(req, res, this.bucketComponent);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketRouteDeleteHandler(req, res, this.dataSource, this.bucketComponent);
    }
}
