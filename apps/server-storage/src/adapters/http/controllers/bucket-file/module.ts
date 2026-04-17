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
import type { DataSource } from 'typeorm';
import type { Client } from 'minio';
import type { BucketFileEntity } from '../../../database/index.ts';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import {
    executeBucketFileRouteDeleteHandler,
    executeBucketFileRouteGetManyHandler,
    executeBucketFileRouteGetOneHandler,
    executeBucketFileRouteStreamHandler,
} from './handlers/index.ts';

type PartialBucketFile = Partial<BucketFileEntity>;

@DTags('buckets')
@DController('/bucket-files')
export class BucketFileController {
    private dataSource: DataSource;

    private minio: Client;

    private bucketFileComponent: BucketFileComponent;

    private logger: Logger | undefined;

    constructor(ctx: {
        dataSource: DataSource;
        minio: Client;
        bucketFileComponent: BucketFileComponent;
        logger?: Logger;
    }) {
        this.dataSource = ctx.dataSource;
        this.minio = ctx.minio;
        this.bucketFileComponent = ctx.bucketFileComponent;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialBucketFile[]> {
        return await executeBucketFileRouteGetManyHandler(req, res, this.dataSource) as PartialBucketFile[];
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<any> {
        return await executeBucketFileRouteStreamHandler(req, res, this.dataSource, this.minio, this.logger) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialBucketFile | undefined> {
        return await executeBucketFileRouteGetOneHandler(req, res, this.dataSource) as PartialBucketFile | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialBucketFile | undefined> {
        return await executeBucketFileRouteDeleteHandler(req, res, this.dataSource, this.bucketFileComponent) as PartialBucketFile | undefined;
    }
}
