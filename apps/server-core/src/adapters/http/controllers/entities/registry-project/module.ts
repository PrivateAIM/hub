/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
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
import type { IRegistryProjectService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialRegistryProject = Partial<RegistryProject>;

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
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialRegistryProject[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        return sendCreated(res, entity) as PartialRegistryProject | undefined;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        const query = useRequestQuery(req);
        const entity = await this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);
        return send(res, entity) as PartialRegistryProject | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.update(id, data, actor);
        return sendAccepted(res, entity) as PartialRegistryProject | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        return sendAccepted(res, entity) as PartialRegistryProject | undefined;
    }
}
