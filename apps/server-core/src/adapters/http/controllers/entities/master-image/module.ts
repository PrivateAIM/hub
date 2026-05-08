/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
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
        @DContext() event: IRoutupEvent,
    ) {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<PartialMasterImage | undefined> {
        return this.service.getOne(id);
    }

    @DPost('/command', [ForceLoggedInMiddleware])
    async runCommand(
        @DBody() data: {
            command: MasterImageCommand;
            id?: string;
        },
        @DContext() event: IRoutupEvent,
    ) {
        const actor = buildActorContext(event);
        const entity = await this.service.executeCommand(data.command, data, actor);
        event.response.status = 202;
        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<PartialMasterImage | undefined> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
