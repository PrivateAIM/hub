/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBucket,
} from '@privateaim/core';
import {
    DController, DGet, DPath, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    getManyAnalysisBucketRouteHandler,
    getOneAnalysisBucketRouteHandler,
} from './handlers';

type PartialAnalysisBucket = Partial<AnalysisBucket>;

@DTags('analysis')
@DController('/analysis-buckets')
export class AnalysisBucketController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucket[]> {
        return await getManyAnalysisBucketRouteHandler(req, res) as PartialAnalysisBucket[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        return await getOneAnalysisBucketRouteHandler(req, res) as PartialAnalysisBucket | undefined;
    }
}
