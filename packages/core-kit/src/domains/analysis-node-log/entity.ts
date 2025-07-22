/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { LogLevel } from '@privateaim/kit';
import type {
    Analysis,
} from '../analysis';
import type { Node } from '../node';

export interface AnalysisNodeLog {
    id: string;

    /**
     * e.g: entrypointNotFound, ...
     */
    code: string | null;

    /**
     * e.g. started, finished, failed, ...
     */
    status: string | null;

    /**
     * unix log level
     */
    level: `${LogLevel}`;

    /**
     * message
     */
    message: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    analysis_realm_id: Realm['id'];

    analysis_id: Analysis['id'];

    // ------------------------------------------------------------------

    node_id: Node['id'];

    node_realm_id: Realm['id'];
}
