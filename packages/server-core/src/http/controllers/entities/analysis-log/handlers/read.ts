/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogLevel } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import { BadRequestError } from '@ebec/http';
import { type FiltersBuildInput, parseQuery } from 'rapiq';
import type { AnalysisLog } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../../services/index.ts';

export async function getManyAnalysisLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQuery<AnalysisLog>(
        useRequestQuery(req),
        {
            defaultPath: 'log',
            filters: {
                allowed: [
                    'level',
                    'analysis_id',
                ],
            },
            pagination: {
                maxLimit: 50,
            },
            sort: {
                allowed: ['time'],
            },
        },
    );

    // todo: clean up this

    const filtersNormalized : Partial<Record<keyof AnalysisLog, string>> = {};
    if (output.filters) {
        for (let i = 0; i < output.filters.length; i++) {
            filtersNormalized[output.filters[i].key] = `${output.filters[i].value}`;
        }
    }

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

    // todo: sort missing

    if (isTelemetryClientUsable()) {
        const telemetryClient = useTelemetryClient();

        const response = await telemetryClient.log.getMany({
            filters,
            pagination: output.pagination,
        });

        return send(res, response);
    }

    return send(res, {
        data: [],
        meta: {
            total: 0,
            pagination: {
                limit: 50,
                offset: 0,
            },
        },
    });
}
