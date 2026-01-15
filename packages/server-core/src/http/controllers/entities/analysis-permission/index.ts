/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisPermission,
} from '@privateaim/core-kit';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisPermissionRouteHandler,
    deleteAnalysisPermissionRouteHandler,
    getManyAnalysisPermissionRouteHandler,
    getOneAnalysisPermissionRouteHandler,
    updateAnalysisPermissionRouteHandler,
} from './handlers/index.ts';

type PartialAnalysisPermission = Partial<AnalysisPermission>;

@DTags('analysis', 'permission')
@DController('/analysis-permissions')
export class AnalysisPermissionController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisPermission[]> {
        return await getManyAnalysisPermissionRouteHandler(req, res) as PartialAnalysisPermission[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisPermission | undefined> {
        return await getOneAnalysisPermissionRouteHandler(req, res) as PartialAnalysisPermission | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: AnalysisPermission,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisPermission | undefined> {
        return await updateAnalysisPermissionRouteHandler(req, res) as PartialAnalysisPermission | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysisPermission,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisPermission | undefined> {
        return await createAnalysisPermissionRouteHandler(req, res) as PartialAnalysisPermission | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisPermission | undefined> {
        return await deleteAnalysisPermissionRouteHandler(req, res) as PartialAnalysisPermission | undefined;
    }
}
