/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Log } from '@privateaim/telemetry-kit';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import type { FiltersBuildInput } from 'rapiq';
import { parseQueryFilters } from 'rapiq';
import { useRequestQuery } from '@routup/basic/query';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../services';

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

    const filters : FiltersBuildInput<Log> = {
        labels: {
            entity: 'analysisNode',
        },
        time: `>${((BigInt(Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 31 * 12 * 10))) * 1_000_000n).toString()}`,
    };

    if (output) {
        for (let i = 0; i < output.length; i++) {
            filters.labels = filters.labels || {};
            filters.labels[output[i].key] = `${output[i].value}`;
        }
    }

    if (!filters.labels?.analysis_id || !filters.labels?.node_id) {
        throw new BadRequestError('The filters node_id and analysis_id must be defined.');
    }

    // todo: check permissions

    if (isTelemetryClientUsable()) {
        const telemetryClient = useTelemetryClient();
        await telemetryClient.log.deleteMany({
            filters,
        });
    }

    return sendAccepted(res);
}
