/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { type FiltersParseOutputElement, parseQueryFilters } from 'rapiq';
import { useRequestQuery } from '@routup/basic/query';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type { AnalysisNodeLogEntity } from '../../../../domains';
import { useAnalysisNodeLogStore } from '../../../../services';

export async function deleteAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQueryFilters<AnalysisNodeLogEntity>(useRequestQuery(req, 'filter'), {
        allowed: [
            'analysis_id',
            'node_id',
        ],
    });

    const filters : Partial<Record<keyof AnalysisNodeLog, FiltersParseOutputElement>> = {};

    if (output) {
        for (let i = 0; i < output.length; i++) {
            filters[output[i].key as keyof AnalysisNodeLog] = output[i];
        }
    }

    if (!filters.analysis_id || !filters.node_id) {
        throw new BadRequestError('The filters node_id and analysis_id must be defined.');
    }

    // todo: check permissions

    const store = useAnalysisNodeLogStore();
    await store.delete({
        analysis_id: `${filters.analysis_id.value}`,
        node_id: `${filters.node_id.value}`,
        start: Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 31 * 12 * 10),
    });

    return sendAccepted(res);
}
