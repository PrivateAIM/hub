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
import type { AnalysisLog } from '@privateaim/core-kit';
import { useRequestQuery } from '@routup/basic/query';
import { useAnalysisLogStore } from '../../../../domains';

export async function deleteAnalysisLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQueryFilters<AnalysisLog>(
        useRequestQuery(req, 'filter'),
        {
            allowed: [
                'analysis_id',
            ],
        },
    );

    const filters : Partial<Record<keyof AnalysisLog, FiltersParseOutputElement>> = {};

    if (output) {
        for (let i = 0; i < output.length; i++) {
            filters[output[i].key as keyof AnalysisLog] = output[i];
        }
    }

    if (!filters.analysis_id) {
        throw new BadRequestError('The filter analysis_id must be defined.');
    }

    const store = useAnalysisLogStore();
    await store.delete({
        analysis_id: `${filters.analysis_id.value}`,
        start: Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 31 * 12 * 10),
    });

    return sendAccepted(res);
}
