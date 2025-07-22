/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import { BadRequestError } from '@ebec/http';
import { FilterComparisonOperator, parseQuery } from 'rapiq';
import type { AnalysisLog } from '@privateaim/core-kit';
import type { AnalysisLogQueryOptions } from '../../../../domains';
import { useAnalysisLogStore } from '../../../../domains';

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

    const options : AnalysisLogQueryOptions = {};

    if (output.filters) {
        for (let i = 0; i < output.filters.length; i++) {
            const key = output.filters[i].key as keyof AnalysisLog;
            if (key === 'analysis_id') {
                options.analysis_id = `${output.filters[i].value}`;
            } else if (key === 'time') {
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

    if (!options.analysis_id) {
        throw new BadRequestError('The filter analysis_id must be defined.');
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

    const store = useAnalysisLogStore();
    const [data, total] = await store.query(options);

    return send(res, {
        data,
        meta: {
            total,
            pagination: output.pagination,
        },
    });
}
