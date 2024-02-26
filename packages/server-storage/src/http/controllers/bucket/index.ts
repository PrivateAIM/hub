/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Project,
} from '@privateaim/core';
import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import type { BucketFileEntity } from '../../../domains';
import { BucketEntity } from '../../../domains';
import { ForceLoggedInMiddleware } from '../../middlewares';
import {
    executeBucketRouteCreateHandler,
    executeBucketRouteDeleteHandler,
    executeBucketRouteGetManyHandler,
    executeBucketRouteGetOneHandler,
    executeBucketRouteUpdateHandler,
    executeBucketRouteUploadHandler,
} from './handlers';

type PartialBucket = Partial<Project>;

@DTags('buckets')
@DController('/buckets')
export class BucketController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialBucket[]> {
        return await executeBucketRouteGetManyHandler(req, res) as PartialBucket[];
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
    ): Promise<PartialBucket | undefined> {
        return await executeBucketRouteGetOneHandler(req, res) as PartialBucket | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
            @DBody() data: BucketEntity,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialBucket | undefined> {
        return await executeBucketRouteUpdateHandler(req, res) as PartialBucket | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: BucketEntity,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialBucket | undefined> {
        return await executeBucketRouteCreateHandler(req, res) as PartialBucket | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialBucket | undefined> {
        return await executeBucketRouteDeleteHandler(req, res) as PartialBucket | undefined;
    }
}
