/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import type { FiltersParseOutputElement } from 'rapiq';
import { FilterComparisonOperator, parseQuery } from 'rapiq';
import {
    applyQueryParseOutput,
    useDataSource,
} from 'typeorm-extension';
import type { LokiQuerierQueryRangeOptions } from '@privateaim/server-kit';
import { isLokiClientUsable, useLokiClient } from '@privateaim/server-kit';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { BadRequestError } from '@ebec/http';
import { AnalysisNodeLogEntity } from '../../../../domains';
import { buildLokiLabelsForAnalysisNodeLog, buildLokiQueryForLabels } from '../../../../domains/analysis-node-log/loki';

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

    const filters : Partial<Record<keyof AnalysisNodeLog, FiltersParseOutputElement>> = {};

    if (output.filters) {
        for (let i = 0; i < output.filters.length; i++) {
            filters[output.filters[i].key as keyof AnalysisNodeLog] = output.filters[i];
        }
    }

    if (!filters.analysis_id || !filters.node_id) {
        throw new BadRequestError('The filters node_id and analysis_id must be defined.');
    }

    // todo: check permissions

    let data: AnalysisNodeLog[] = [];
    let total : number | undefined;

    if (isLokiClientUsable()) {
        const client = useLokiClient();

        const labels = buildLokiLabelsForAnalysisNodeLog({
            analysis_id: filters.analysis_id.value as string,
            node_id: filters.node_id.value as string,
        });
        const options : LokiQuerierQueryRangeOptions = {
            query: buildLokiQueryForLabels(labels),
        };

        if (output.sort) {
            const sort : Partial<Record<keyof AnalysisNodeLog, string>> = {};
            for (let i = 0; i < output.sort.length; i++) {
                sort[output.sort[i].key as keyof AnalysisNodeLog] = output.sort[i].value;
            }

            if (sort.created_at) {
                options.direction = sort.created_at === 'DESC' ?
                    'forward' :
                    'backward';
            }
        }

        if (output.pagination && output.pagination.limit) {
            options.limit = output.pagination.limit;
        }

        if (filters.created_at) {
            if (
                filters.created_at.operator === FilterComparisonOperator.LESS_THAN ||
                filters.created_at.operator === FilterComparisonOperator.LESS_THAN_EQUAL
            ) {
                options.end = (BigInt(new Date(`${filters.created_at.value}`).getTime()) * 1_000_000n).toString();
            }

            if (
                filters.created_at.operator === FilterComparisonOperator.GREATER_THAN ||
                filters.created_at.operator === FilterComparisonOperator.GREATER_THAN_EQUAL
            ) {
                options.start = (BigInt(new Date(`${filters.created_at.value}`).getTime()) * 1_000_000n).toString();
            }
        }

        const response = await client.querier.queryRange(options);
        if (response.data.resultType === 'streams') {
            for (let i = 0; i < response.data.result.length; i++) {
                const set = response.data.result[i];

                for (let j = 0; j < set.value.length; j++) {
                    const date = new Date(Number(BigInt(set.value[j][0]) / 1_000_000n));

                    data.push({
                        ...set.stream,
                        id: `${date.getTime()}`,
                        message: set.value[j][0],
                        created_at: date.toISOString() as unknown as Date,
                        updated_at: date.toISOString() as unknown as Date,
                        analysis_id: `${filters.analysis_id.value}`,
                        node_id: `${filters.node_id.value}`,
                    } satisfies Partial<AnalysisNodeLog> as AnalysisNodeLog);
                }
            }
        }
    } else {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(AnalysisNodeLogEntity);
        const query = repository.createQueryBuilder('log');
        query.distinctOn(['log.id']);

        applyQueryParseOutput(query, output);

        [data, total] = await query.getManyAndCount();
    }

    return send(res, {
        data,
        meta: {
            total,
            pagination: output.pagination,
        },
    });
}
