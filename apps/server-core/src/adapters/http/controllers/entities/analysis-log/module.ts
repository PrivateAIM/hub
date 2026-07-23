/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { Log, LogLevel, APIClient as TelemetryClient } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { BadRequestError } from '@privateaim/errors';
import {
    DContext,
    DController,
    DDelete,
    DGet,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { FiltersBuildInput } from '@rapiq/core';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import { analysisLogSchema } from '../../../../../core/entities/analysis-log/schema.ts';
import { collectRootFilterValues, decodeQuery } from '../../../../../core/query/index.ts';

type AnalysisLogControllerContext = {
    telemetryClient?: TelemetryClient;
};

@DTags('analysis')
@DController('/analysis-logs')
export class AnalysisLogController {
    protected telemetryClient?: TelemetryClient;

    constructor(ctx: AnalysisLogControllerContext = {}) {
        this.telemetryClient = ctx.telemetryClient;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ) {
        const query = decodeQuery(useRequestQuery(event), { schema: analysisLogSchema });

        const filtersNormalized = collectRootFilterValues(query);

        if (!filtersNormalized.analysis_id) {
            throw new BadRequestError('The filter analysis_id must be defined.');
        }

        const filters : FiltersBuildInput<Log> = {
            labels: {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                [LogFlag.REF_ID]: filtersNormalized.analysis_id,
            },
        };

        if (filtersNormalized.level) {
            filters.level = filtersNormalized.level as LogLevel;
        }

        if (this.telemetryClient) {
            return this.telemetryClient.log.getMany({
                filters,
                pagination: {
                    limit: query.pagination.limit,
                    offset: query.pagination.offset,
                },
            });
        }

        return {
            data: [],
            meta: {
                total: 0,
                pagination: {
                    limit: 50,
                    offset: 0,
                },
            },
        };
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async drop(
        @DContext() event: IAppEvent,
    ) {
        const query = decodeQuery(useRequestQuery(event), {
            schema: analysisLogSchema,
            parameters: ['filters'],
        });

        const filtersNormalized = collectRootFilterValues(query);

        if (!filtersNormalized.analysis_id) {
            throw new BadRequestError('The filter analysis_id must be defined.');
        }

        const filters : FiltersBuildInput<Log> = {
            labels: {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                [LogFlag.REF_ID]: filtersNormalized.analysis_id,
            },
            time: `${((BigInt(Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 31 * 12 * 10))) * 1_000_000n).toString()}`,
        };

        if (filtersNormalized.level) {
            filters.level = filtersNormalized.level as LogLevel;
        }

        if (this.telemetryClient) {
            await this.telemetryClient.log.deleteMany({ filters });
        }

        event.response.status = 202;
        return null;
    }
}
