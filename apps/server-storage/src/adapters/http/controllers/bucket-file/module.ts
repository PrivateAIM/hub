/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import {
    DController,
    DDelete,
    DGet,
    DPath,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { BucketFileEventCaller } from '@privateaim/server-storage-kit';
import type { DataSource } from 'typeorm';
import type { Client } from 'minio';
import type { Request, Response } from 'routup';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import {
    executeBucketFileRouteDeleteHandler,
    executeBucketFileRouteGetManyHandler,
    executeBucketFileRouteGetOneHandler,
    executeBucketFileRouteStreamHandler,
} from './handlers/index.ts';

@DTags('buckets')
@DController('/bucket-files')
export class BucketFileController {
    private dataSource: DataSource;

    private minio: Client;

    private bucketFileComponent: BucketFileComponent;

    private bucketFileEventCaller: BucketFileEventCaller;

    private logger: Logger | undefined;

    constructor(ctx: {
        dataSource: DataSource;
        minio: Client;
        bucketFileComponent: BucketFileComponent;
        bucketFileEventCaller: BucketFileEventCaller;
        logger?: Logger;
    }) {
        this.dataSource = ctx.dataSource;
        this.minio = ctx.minio;
        this.bucketFileComponent = ctx.bucketFileComponent;
        this.bucketFileEventCaller = ctx.bucketFileEventCaller;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketFileRouteGetManyHandler(req, res, this.dataSource);
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketFileRouteStreamHandler(req, res, this.dataSource, this.minio, this.logger);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketFileRouteGetOneHandler(req, res, this.dataSource);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return executeBucketFileRouteDeleteHandler(
            req,
            res,
            this.dataSource,
            this.bucketFileComponent,
            this.bucketFileEventCaller,
        );
    }
}
