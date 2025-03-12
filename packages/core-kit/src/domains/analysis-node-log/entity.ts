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
    id: string;

    /**
     * is it an error log?
     */
    error: boolean;

    /**
     * e.g: trainNotBuild, entrypointNotFound, ...
     */
    error_code: string | null;

    /**
     * e.g. started, finished, failed, ...
     */
    status: string | null;

    /**
     * e.g: error_message
     */
    status_message: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    analysis_id: Analysis['id'];

    analysis: Analysis;

    // ------------------------------------------------------------------

    node_id: Node['id'];

    node: Node;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];
}
