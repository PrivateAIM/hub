/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientPermission } from '@authup/core-kit';
import type { EntityRecordResponse } from '@privateaim/core-http-kit';
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
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import type { IAnalysisClientPermissionService } from '../../../../../core/services/analysis-client-permission/index.ts';

type AnalysisClientPermissionControllerContext = {
    service: IAnalysisClientPermissionService;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisClientPermissionController {
    protected service: IAnalysisClientPermissionService;

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
        @DBody() data: { permissionId: string },
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<ClientPermission>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(id, data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }

    @DDelete('/:id/client/permissions/:permissionId', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DPath('permissionId') permissionId: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<ClientPermission>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, permissionId, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
