/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Log, LogLevel } from '@privateaim/telemetry-kit';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import type { FiltersBuildInput } from 'rapiq';
import { parseQuery } from 'rapiq';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../services';

export async function getManyAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQuery<AnalysisNodeLog>(useRequestQuery(req), {
        filters: {
            allowed: [
                'level',
                'analysis_id',
                'node_id',
                'time',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['time'],
        },
    });

    if (!isTelemetryClientUsable()) {
        throw new BadRequestError('The telemetry service is not configured, therefore logs can not be read.');
    }

    const telemetryClient = useTelemetryClient();

    const filters : FiltersBuildInput<Log> = {
        labels: {
            entity: 'analysisNode',
        },
    };

    // todo: clean up this

    for (let i = 0; i < output.filters.length; i++) {
        const filter = output.filters[i];
        if (filter.key === 'analysis_id' || filter.key === 'node_id') {
            filters.labels = filters.labels || {};
            filters.labels[filter.key] = `${filter.value}`;

            continue;
        }

        if (filter.key === 'level') {
            filters.level = `${filter.value}` as LogLevel;
        }

        if (filter.key === 'time') {
            // todo: respect operator
            filters.time = `>${filter.value}`;
        }
    }

    // todo: sort missing

    const response = await telemetryClient.log.getMany({
        filters,
        pagination: output.pagination,
    });

    return send(res, response);
}
