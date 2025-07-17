/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import { FilterComparisonOperator, parseQuery } from 'rapiq';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { BadRequestError } from '@ebec/http';
import type { AnalysisNodeLogEntity } from '../../../../database';
import type { AnalysisNodeLogQueryOptions } from '../../../../domains';
import { useAnalysisNodeLogStore } from '../../../../domains';

export async function getManyAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQuery<AnalysisNodeLogEntity>(useRequestQuery(req), {
        defaultPath: 'log',
        filters: {
            allowed: [
                'level',
                'analysis_id',
                'node_id',
                'created_at',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['created_at'],
        },
    });

    const options : AnalysisNodeLogQueryOptions = {};

    if (output.filters) {
        for (let i = 0; i < output.filters.length; i++) {
            const key = output.filters[i].key as keyof AnalysisNodeLog;
            if (key === 'analysis_id') {
                options.analysis_id = `${output.filters[i].value}`;
            } else if (key === 'node_id') {
                options.node_id = `${output.filters[i].value}`;
            } else if (key === 'created_at') {
                if (
                    output.filters[i].operator === FilterComparisonOperator.LESS_THAN ||
                    output.filters[i].operator === FilterComparisonOperator.LESS_THAN_EQUAL
                ) {
                    options.end = new Date(`${output.filters[i].value}`).getTime();
                }

                if (
                    output.filters[i].operator === FilterComparisonOperator.GREATER_THAN ||
                    output.filters[i].operator === FilterComparisonOperator.GREATER_THAN_EQUAL
                ) {
                    options.start = new Date(`${output.filters[i].value}`).getTime();
                }
            }
        }
    }

    if (!options.analysis_id || !options.node_id) {
        throw new BadRequestError('The filters node_id and analysis_id must be defined.');
    }

    // todo: check permissions

    if (output.sort) {
        for (let i = 0; i < output.sort.length; i++) {
            if (output.sort[i].key === 'created_at') {
                options.sort = output.sort[i].value;
            }
        }
    }

    if (output.pagination && output.pagination.limit) {
        options.limit = output.pagination.limit;
    }

    const store = useAnalysisNodeLogStore();
    const [data, total] = await store.query(options);

    return send(res, {
        data,
        meta: {
            total,
            pagination: output.pagination,
        },
    });
}
