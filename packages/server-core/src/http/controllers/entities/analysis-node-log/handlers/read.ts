/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Log, LogLevel } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import type { FiltersBuildInput } from 'rapiq';
import { parseQuery } from 'rapiq';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../../services/index.ts';

export async function getManyAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQuery<AnalysisNodeLog>(useRequestQuery(req), {
        filters: {
            allowed: [
                'level',
                'analysis_id',
                'node_id',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['time'],
        },
    });

    // todo: clean up this

    const filtersNormalized : Partial<Record<keyof AnalysisNodeLog, string>> = {};
    if (output.filters) {
        for (let i = 0; i < output.filters.length; i++) {
            filtersNormalized[output.filters[i].key] = `${output.filters[i].value}`;
        }
    }

    if (!filtersNormalized.analysis_id || !filtersNormalized.node_id) {
        throw new BadRequestError('The filters node_id and analysis_id must be defined.');
    }

    const filters : FiltersBuildInput<Log> = {
        labels: {
            [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
            analysis_id: filtersNormalized.analysis_id,
            node_id: filtersNormalized.node_id,
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
