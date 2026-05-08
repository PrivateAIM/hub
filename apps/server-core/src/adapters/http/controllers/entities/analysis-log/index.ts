/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    AnalysisLog,
} from '@privateaim/core-kit';
import type { APIClient as TelemetryClient } from '@privateaim/telemetry-kit';

import {
    DContext,
    DController,
    DDelete,
    DGet,
    DTags,
} from '@routup/decorators';
import type { IRoutupEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    deleteAnalysisLogRouteHandler,
    getManyAnalysisLogRouteHandler,
} from './handlers/index.ts';

type PartialAnalysisLog = Partial<AnalysisLog>;

@DTags('analysis')
@DController('/analysis-logs')
export class AnalysisLogController {
    protected telemetryClient?: TelemetryClient;

    constructor(ctx: { telemetryClient?: TelemetryClient } = {}) {
        this.telemetryClient = ctx.telemetryClient;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IRoutupEvent,
    ): Promise<PartialAnalysisLog[]> {
        return await getManyAnalysisLogRouteHandler(event, this.telemetryClient) as PartialAnalysisLog[];
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async drop(
        @DContext() event: IRoutupEvent,
    ): Promise<PartialAnalysisLog | undefined> {
        return await deleteAnalysisLogRouteHandler(event, this.telemetryClient) as PartialAnalysisLog | undefined;
    }
}
