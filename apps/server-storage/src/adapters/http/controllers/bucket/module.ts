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
import type { BucketFileEntity } from '../../../database/index.ts';
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
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<Bucket[]> {
        return await executeBucketRouteGetManyHandler(req, res, this.dataSource) as Bucket[];
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<any> {
        return await executeBucketRouteStreamHandler(req, res, this.dataSource, this.minio, this.logger) as any;
    }

    @DPost('/:id/upload', [ForceLoggedInMiddleware])
    async upload(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<BucketFileEntity[]> {
        return await executeBucketRouteUploadHandler(
            req,
            res,
            this.dataSource,
            this.bucketFileComponent,
            this.bucketFileEventCaller,
        ) as BucketFileEntity[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteGetOneHandler(req, res, this.dataSource) as Bucket | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
        @DBody() data: BucketUpdate,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteUpdateHandler(req, res, this.dataSource, this.minio) as Bucket | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: BucketCreate,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteCreateHandler(req, res, this.bucketComponent) as Bucket | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteDeleteHandler(req, res, this.dataSource, this.bucketComponent) as Bucket | undefined;
    }
}
