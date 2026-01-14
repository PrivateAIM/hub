/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { BucketFileEntity } from '../../../database/index.ts';
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
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<Bucket[]> {
        return await executeBucketRouteGetManyHandler(req, res) as Bucket[];
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return await executeBucketRouteStreamHandler(req, res) as any;
    }

    @DPost('/:id/upload', [ForceLoggedInMiddleware])
    async upload(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<BucketFileEntity[]> {
        return await executeBucketRouteUploadHandler(req, res) as BucketFileEntity[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteGetOneHandler(req, res) as Bucket | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
            @DBody() data: BucketUpdate,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteUpdateHandler(req, res) as Bucket | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: BucketCreate,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteCreateHandler(req, res) as Bucket | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<Bucket | undefined> {
        return await executeBucketRouteDeleteHandler(req, res) as Bucket | undefined;
    }
}
