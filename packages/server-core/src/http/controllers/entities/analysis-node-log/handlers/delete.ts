/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Log } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import type { FiltersBuildInput } from 'rapiq';
import { parseQueryFilters } from 'rapiq';
import { useRequestQuery } from '@routup/basic/query';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../../services/index.ts';

export async function deleteAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQueryFilters<AnalysisNodeLog>(
        useRequestQuery(req, 'filter'),
        {
            allowed: [
                'analysis_id',
                'node_id',
            ],
        },
    );

    const filtersNormalized : Partial<Record<keyof AnalysisNodeLog, string>> = {};
    if (output) {
        for (let i = 0; i < output.length; i++) {
            filtersNormalized[output[i].key] = `${output[i].value}`;
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
        time: `${((BigInt(Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 31 * 12 * 10))) * 1_000_000n).toString()}`,
    };

    // todo: check permissions

    if (isTelemetryClientUsable()) {
        const telemetryClient = useTelemetryClient();
        await telemetryClient.log.deleteMany({
            filters,
        });
    }

    return sendAccepted(res);
}
