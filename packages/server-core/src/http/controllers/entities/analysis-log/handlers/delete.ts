/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Log, LogLevel } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { type FiltersBuildInput, parseQueryFilters } from 'rapiq';
import type { AnalysisLog } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { useRequestQuery } from '@routup/basic/query';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../../services/index.ts';

export async function deleteAnalysisLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const output = parseQueryFilters<AnalysisLog>(
        useRequestQuery(req, 'filter'),
        {
            allowed: [
                'analysis_id',
                'level',
            ],
        },
    );

    const filtersNormalized : Partial<Record<keyof AnalysisLog, string>> = {};
    if (output) {
        for (let i = 0; i < output.length; i++) {
            filtersNormalized[output[i].key] = `${output[i].value}`;
        }
    }

    if (!filtersNormalized.analysis_id) {
        throw new BadRequestError('The filter analysis_id must be defined.');
    }

    const filters : FiltersBuildInput<Log> = {
        labels: {
            [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
            [LogFlag.REF_ID]: filtersNormalized.analysis_id,
        },
        time: `${((BigInt(Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 31 * 12 * 10))) * 1_000_000n).toString()}`,
    };

    if (filtersNormalized.level) {
        filters.level = filtersNormalized.level as LogLevel;
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
