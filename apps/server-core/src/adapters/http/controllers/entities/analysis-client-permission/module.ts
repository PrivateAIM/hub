/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DBody,
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DTags,
} from '@routup/decorators';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { AnalysisClientPermissionService } from '../../../../../app/modules/database/analysis-client-permission.ts';
import { buildActorContext } from '../../../request/index.ts';

type AnalysisClientPermissionControllerContext = {
    service: AnalysisClientPermissionService;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisClientPermissionController {
    protected service: AnalysisClientPermissionService;

    constructor(ctx: AnalysisClientPermissionControllerContext) {
        this.service = ctx.service;
    }

    @DGet('/:id/client/permissions', [ForceLoggedInMiddleware])
    async getMany(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ) {
        const actor = buildActorContext(event);
        const { data, meta } = await this.service.getMany(id, actor);
        return { data, meta };
    }

    @DPost('/:id/client/permissions', [ForceLoggedInMiddleware])
    async add(
        @DPath('id') id: string,
        @DBody() data: { permission_id: string },
        @DContext() event: IAppEvent,
    ) {
        const actor = buildActorContext(event);
        const entity = await this.service.create(id, data, actor);
        event.response.status = 201;
        return entity;
    }

    @DDelete('/:id/client/permissions/:permissionId', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DPath('permissionId') permissionId: string,
        @DContext() event: IAppEvent,
    ) {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, permissionId, actor);
        event.response.status = 202;
        return entity;
    }
}
