/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import type { EntityCollectionResponse, EntityRecordResponse } from '@privateaim/core-http-kit';
import {
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IMasterImageGroupService } from '../../../../../core/index.ts';
import { masterImageGroupSchema } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type MasterImageGroupControllerContext = {
    service: IMasterImageGroupService;
};

@DTags('master-image')
@DController('/master-image-groups')
export class MasterImageGroupController {
    protected service: IMasterImageGroupService;

    constructor(ctx: MasterImageGroupControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<MasterImageGroup>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta: { ...meta, schema: describeQuerySchema(masterImageGroupSchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<EntityRecordResponse<MasterImageGroup>> {
        const entity = await this.service.getOne(id);

        return {
            data: entity,
            meta: { schema: describeQuerySchema(masterImageGroupSchema, RECORD_QUERY_PARAMETERS) },
        };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<MasterImageGroup>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
