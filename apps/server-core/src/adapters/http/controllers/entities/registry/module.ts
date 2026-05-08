/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import type { RegistryCreatePayload, RegistryUpdatePayload } from '@privateaim/core-http-kit';
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
import type { IRegistryService } from '../../../../../core/index.ts';
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
        @DContext() event: IRoutupEvent,
    ) {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, actor);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<Registry> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        return this.service.getOne(id, actor, Object.keys(query).length > 0 ? query : undefined);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: RegistryCreatePayload,
        @DContext() event: IRoutupEvent,
    ): Promise<Registry> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return entity;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: RegistryUpdatePayload,
        @DContext() event: IRoutupEvent,
    ): Promise<Registry> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<Registry> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
