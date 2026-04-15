/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import {
    DController,
    DDelete,
    DGet,
    DPath,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { send, sendAccepted } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IMasterImageGroupService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialMasterImageGroup = Partial<MasterImageGroup>;

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
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialMasterImageGroup[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        const entity = await this.service.getOne(id);
        return send(res, entity) as PartialMasterImageGroup | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        return sendAccepted(res, entity) as PartialMasterImageGroup | undefined;
    }
}
