/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
import type { EntityCollectionResponse, EntityRecordResponse } from '@privateaim/core-http-kit';
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
import type { IMasterImageService } from '../../../../../core/index.ts';
import { masterImageSchema } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

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
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<MasterImage>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta: { ...meta, schema: describeQuerySchema(masterImageSchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<MasterImage>> {
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);

        return { data: entity, meta: { schema: describeQuerySchema(masterImageSchema, RECORD_QUERY_PARAMETERS) } };
    }

    @DPost('/command', [ForceLoggedInMiddleware])
    async runCommand(
        @DBody() data: {
            command: MasterImageCommand;
            id?: string;
        },
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<MasterImage | null>> {
        const actor = buildActorContext(event);
        const entity = await this.service.executeCommand(data.command, data, actor);
        event.response.status = 202;

        // The SYNC branch resolves without an entity — coalesce so the
        // envelope always carries an explicit `data` key on the wire.
        return { data: entity ?? null, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<MasterImage>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
