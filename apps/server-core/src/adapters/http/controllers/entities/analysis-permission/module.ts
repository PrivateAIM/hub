/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisPermission } from '@privateaim/core-kit';
import type { AnalysisPermissionCreatePayload } from '@privateaim/core-http-kit';
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
import { useRequestQuery } from '@routup/basic/query';
import type { IRoutupEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IAnalysisPermissionService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

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
        @DContext() event: IRoutupEvent,
    ) {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: AnalysisPermissionCreatePayload,
        @DContext() event: IRoutupEvent,
    ): Promise<AnalysisPermission> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return entity;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<AnalysisPermission> {
        return this.service.getOne(id);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<AnalysisPermission> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
