/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    AnalysisNodeLog,
} from '@privateaim/core-kit';
import type { APIClient as TelemetryClient } from '@privateaim/telemetry-kit';

import {
    DContext,
    DController,
    DDelete,
    DGet,
    DPost,
    DTags,
} from '@routup/decorators';
import type { IRoutupEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisNodeLogRouteHandler,
    deleteAnalysisNodeLogRouteHandler,
    getManyAnalysisNodeLogRouteHandler,
} from './handlers/index.ts';

type PartialAnalysisLog = Partial<AnalysisNodeLog>;

/**
 * /analysis-node/<analysisNodeId>/logs POST
 * /analysis-node/<analysisNodeId>/logs GET
 * /analysis-node/<analysisNodeId>/logs DELETE
 *
 * /analysis-node-logs POST
 * /analysis-node-logs/?filters[analysis_id]=xxx&filters[node_id]=xxx GET
 * /analysis-node-logs/?filters[analysis_id]=xxx&filters[node_id]=xxx DELETE
 */
@DTags('analysis')
@DController('/analysis-node-logs')
export class AnalysisNodeLogController {
    protected telemetryClient?: TelemetryClient;

    constructor(ctx: { telemetryClient?: TelemetryClient } = {}) {
        this.telemetryClient = ctx.telemetryClient;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IRoutupEvent,
    ): Promise<PartialAnalysisLog | undefined> {
        return await getManyAnalysisNodeLogRouteHandler(event, this.telemetryClient) as PartialAnalysisLog | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DContext() event: IRoutupEvent,
    ): Promise<PartialAnalysisLog | undefined> {
        return await createAnalysisNodeLogRouteHandler(event, this.telemetryClient) as PartialAnalysisLog | undefined;
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async drop(
        @DContext() event: IRoutupEvent,
    ): Promise<PartialAnalysisLog | undefined> {
        return await deleteAnalysisNodeLogRouteHandler(event, this.telemetryClient) as PartialAnalysisLog | undefined;
    }
}
