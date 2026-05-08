/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import {
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IRoutupEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IMasterImageGroupService } from '../../../../../core/index.ts';
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
        @DContext() event: IRoutupEvent,
    ) {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<MasterImageGroup> {
        return this.service.getOne(id);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<MasterImageGroup> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
