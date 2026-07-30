/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type {
    Analysis,
} from '../analysis';
import type { Node } from '../node';

export interface AnalysisNodeLog {
    message: string,

    level: string,

    labels: Record<string, string>,

    time: string | null,

    /**
     * e.g: entrypointNotFound, ...
     */
    code: string | null;

    /**
     * e.g. started, finished, failed, ...
     */
    status: string | null;

    analysisRealmId: Realm['id'];

    analysisId: Analysis['id'];

    nodeId: Node['id'];

    nodeRealmId: Realm['id'];
}
