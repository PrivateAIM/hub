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
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { Request } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IAnalysisNodeEventService } from '../../../../../core/index.ts';

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
        @DRequest() req: Request,
    ) {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<PartialAnalysisNodeEvent | undefined> {
        return this.service.getOne(id);
    }
}
