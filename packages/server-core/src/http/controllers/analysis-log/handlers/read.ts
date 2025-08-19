/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogLevel } from '@privateaim/telemetry-kit';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import { BadRequestError } from '@ebec/http';
import { type FiltersBuildInput, parseQuery } from 'rapiq';
import type { AnalysisLog } from '@privateaim/core-kit';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../services';

export async function getManyAnalysisLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQuery<AnalysisLog>(
        useRequestQuery(req),
        {
            defaultPath: 'log',
            filters: {
                allowed: [
                    'level',
                    'analysis_id',
                    'time',
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

    const filters : FiltersBuildInput<Log> = {
        labels: {
            entity: 'analysis',
        },
    };

    // todo: clean up this

    for (let i = 0; i < output.filters.length; i++) {
        const filter = output.filters[i];

        if (filter.key === 'analysis_id') {
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

    if (!filters?.labels?.analysis_id) {
        throw new BadRequestError('The filter analysis_id must be defined.');
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
