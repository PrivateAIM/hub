/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type {
    EntityCollectionResponse,
    EntityRecordResponse,
    RegistryProjectCreatePayload,
    RegistryProjectUpdatePayload,
} from '@privateaim/core-http-kit';
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
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IRegistryProjectService } from '../../../../../core/index.ts';
import { registryProjectSchema } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type RegistryProjectControllerContext = {
    service: IRegistryProjectService;
};

@DTags('registry')
@DController('/registry-projects')
export class RegistryProjectController {
    protected service: IRegistryProjectService;

    constructor(ctx: RegistryProjectControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<RegistryProject>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, actor);
        return { data, meta: { ...meta, schema: describeQuerySchema(registryProjectSchema) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: RegistryProjectCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<RegistryProject>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<RegistryProject>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, actor, Object.keys(query).length > 0 ? query : undefined);

        return {
            data: entity,
            meta: { schema: describeQuerySchema(registryProjectSchema, RECORD_QUERY_PARAMETERS) },
        };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: RegistryProjectUpdatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<RegistryProject>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<RegistryProject>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
