/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { 
    Analysis, 
    AnalysisCommand, 
    AnalysisStorageToken, 
    AnalysisStorageTokenCreatePayload, 
} from '@privateaim/core-kit';
import { HubError, UnauthorizedError } from '@privateaim/errors';
import type {
    AnalysisCreatePayload,
    AnalysisUpdatePayload,
    EntityCollectionResponse,
    EntityRecordResponse,
} from '@privateaim/core-http-kit';
import {
    DBody,
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DStatus,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware, buildActorContext, useRequestToken } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IAnalysisService } from '../../../../../core/index.ts';
import { analysisSchema } from '../../../../../core/index.ts';
import type { IStorageCapabilityService } from '../../../../../core/services/storage-capability/index.ts';

type AnalysisControllerContext = {
    service: IAnalysisService;
    storageCapabilityService?: IStorageCapabilityService;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisController {
    protected service: IAnalysisService;

    protected storageCapabilityService: IStorageCapabilityService | undefined;

    constructor(ctx: AnalysisControllerContext) {
        this.service = ctx.service;
        this.storageCapabilityService = ctx.storageCapabilityService;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<Analysis>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, actor);

        return { data, meta: { ...meta, schema: describeQuerySchema(analysisSchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, actor, Object.keys(query).length > 0 ? query : undefined);

        return { data: entity, meta: { schema: describeQuerySchema(analysisSchema, RECORD_QUERY_PARAMETERS) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    @DStatus(201)
    async add(
        @DBody() data: AnalysisCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);

        return { data: entity, meta: {} };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    @DStatus(202)
    async edit(
        @DPath('id') id: string,
        @DBody() data: AnalysisUpdatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);

        return { data: entity, meta: {} };
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    @DStatus(202)
    async doTask(
        @DPath('id') id: string,
        @DBody() data: { command: AnalysisCommand },
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.executeCommand(id, data.command, actor);

        return { data: entity, meta: {} };
    }

    // A credential endpoint: the response is flat, not a { data, meta } envelope.
    @DPost('/:id/storage/token', [ForceLoggedInMiddleware])
    async mintStorageToken(
        @DPath('id') id: string,
        @DBody() data: AnalysisStorageTokenCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<AnalysisStorageToken> {
        if (!this.storageCapabilityService) {
            throw new HubError({
                code: 'not_configured',
                status: 501,
                message: 'Storage capability tokens require a configured Authup URL.',
            });
        }

        const subjectToken = useRequestToken(event);

        if (!subjectToken) {
            throw new UnauthorizedError();
        }

        const actor = buildActorContext(event);

        return this.storageCapabilityService.mint(id, data, actor, subjectToken);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    @DStatus(202)
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);

        return { data: entity, meta: {} };
    }
}
