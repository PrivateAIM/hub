/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import {
    DController,
    DGet,
    DPath,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { send } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IAnalysisNodeEventService } from '../../../../core/index.ts';

type PartialAnalysisNodeEvent = Partial<AnalysisNodeEvent>;

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
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisNodeEvent[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisNodeEvent | undefined> {
        const entity = await this.service.getOne(id);
        return send(res, entity) as PartialAnalysisNodeEvent | undefined;
    }
}
