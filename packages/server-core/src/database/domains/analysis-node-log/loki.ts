/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type { LokiDistributorPushStream } from '@privateaim/server-kit';
import { nanoSeconds } from '@privateaim/server-kit';

export function buildLokiLabelsForAnalysisNodeLog(
    entity: Pick<AnalysisNodeLog, 'analysis_id' | 'node_id'>,
) : Record<string, string> {
    return {
        app: 'hub',
        component: 'serverCore',
        analysis_id: entity.analysis_id,
        node_id: entity.node_id,
    };
}

export function buildLokiQueryForLabels(labels: Record<string, string>) : string {
    const output : string[] = [];

    const keys = Object.keys(labels);
    for (let i = 0; i < keys.length; i++) {
        output.push(`${keys[i]}="${labels[keys[i]]}"`);
    }

    return `{${output.join(',')}}`;
}

export function transformAnalysisNodeLogToLokiStream(
    entity: AnalysisNodeLog,
) : LokiDistributorPushStream {
    return {
        stream: buildLokiLabelsForAnalysisNodeLog(entity),
        values: [
            [nanoSeconds(), entity.message],
        ],
    };
}
