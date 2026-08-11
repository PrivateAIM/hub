/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import type { EntityCollectionResponse, EntityRecordResponse } from '@privateaim/core-http-kit';
import {
    DContext,
    DController,
    DGet,
    DPath,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IAnalysisNodeEventService } from '../../../../../core/index.ts';
import { analysisNodeEventSchema } from '../../../../../core/index.ts';

type AnalysisNodeEventControllerContext = {
    service: IAnalysisNodeEventService;
};

@DTags('analysis-node-event')
@DController('/analysis-node-events')
export class AnalysisNodeEventController {
    protected service: IAnalysisNodeEventService;

    constructor(ctx: AnalysisNodeEventControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<AnalysisNodeEvent>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta: { ...meta, schema: describeQuerySchema(analysisNodeEventSchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisNodeEvent>> {
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);

        return {
            data: entity,
            meta: { schema: describeQuerySchema(analysisNodeEventSchema, RECORD_QUERY_PARAMETERS) },
        };
    }
}
