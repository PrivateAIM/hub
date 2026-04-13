/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisPermission } from '@privateaim/core-kit';
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
import { send, sendAccepted, sendCreated } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IAnalysisPermissionService } from '../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialAnalysisPermission = Partial<AnalysisPermission>;

type AnalysisPermissionControllerContext = {
    service: IAnalysisPermissionService;
};

@DTags('analysis-permission')
@DController('/analysis-permissions')
export class AnalysisPermissionController {
    protected service: IAnalysisPermissionService;

    constructor(ctx: AnalysisPermissionControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisPermission[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisPermission | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        return sendCreated(res, entity) as PartialAnalysisPermission | undefined;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisPermission | undefined> {
        const entity = await this.service.getOne(id);
        return send(res, entity) as PartialAnalysisPermission | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisPermission | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        return sendAccepted(res, entity) as PartialAnalysisPermission | undefined;
    }
}
