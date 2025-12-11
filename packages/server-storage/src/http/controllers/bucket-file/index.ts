/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DController, DDelete, DGet, DPath, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { BucketFileEntity } from '../../../database';
import {
    executeBucketFileRouteDeleteHandler,
    executeBucketFileRouteGetManyHandler,
    executeBucketFileRouteGetOneHandler,
    executeBucketFileRouteStreamHandler,
} from './handlers';

type PartialBucketFile = Partial<BucketFileEntity>;

@DTags('buckets')
@DController('/bucket-files')
export class BucketFileController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialBucketFile[]> {
        return await executeBucketFileRouteGetManyHandler(req, res) as PartialBucketFile[];
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return await executeBucketFileRouteStreamHandler(req, res) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialBucketFile | undefined> {
        return await executeBucketFileRouteGetOneHandler(req, res) as PartialBucketFile | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialBucketFile | undefined> {
        return await executeBucketFileRouteDeleteHandler(req, res) as PartialBucketFile | undefined;
    }
}
