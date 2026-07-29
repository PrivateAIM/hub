/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import type {
    EntityCollectionResponse,
    EntityRecordResponse,
    RegistryCreatePayload,
    RegistryUpdatePayload,
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
import type { IRegistryService } from '../../../../../core/index.ts';
import { registrySchema } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type RegistryControllerContext = {
    service: IRegistryService;
};

@DTags('registry')
@DController('/registries')
export class RegistryController {
    protected service: IRegistryService;

    constructor(ctx: RegistryControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<Registry>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, actor);
        return { data, meta: { ...meta, schema: describeQuerySchema(registrySchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Registry>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, actor, Object.keys(query).length > 0 ? query : undefined);

        return { data: entity, meta: { schema: describeQuerySchema(registrySchema, RECORD_QUERY_PARAMETERS) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: RegistryCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Registry>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: RegistryUpdatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Registry>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Registry>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
