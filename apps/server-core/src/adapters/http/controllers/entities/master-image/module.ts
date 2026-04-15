/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
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
import { send, sendAccepted } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IMasterImageService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialMasterImage = Partial<MasterImage>;

type MasterImageControllerContext = {
    service: IMasterImageService;
};

@DTags('master-image')
@DController('/master-images')
export class MasterImageController {
    protected service: IMasterImageService;

    constructor(ctx: MasterImageControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialMasterImage[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialMasterImage | undefined> {
        const entity = await this.service.getOne(id);
        return send(res, entity) as PartialMasterImage | undefined;
    }

    @DPost('/command', [ForceLoggedInMiddleware])
    async runCommand(
        @DBody() data: {
            command: MasterImageCommand;
            id?: string;
        },
        @DRequest() req: any,
        @DResponse() res: any,
    ) {
        const actor = buildActorContext(req);
        const entity = await this.service.executeCommand(data.command, data, actor);
        return sendAccepted(res, entity);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialMasterImage | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        return sendAccepted(res, entity) as PartialMasterImage | undefined;
    }
}
