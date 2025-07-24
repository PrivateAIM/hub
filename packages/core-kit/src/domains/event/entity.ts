/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';

export interface Event<T extends ObjectLiteral = ObjectLiteral> {
    id: string;

    /**
     * eg. build, push, ...
     */
    scope: string;

    /**
     * eg. started, starting, finished, ...
     */
    name: string;

    /**
     * eg. analysis, node, analysisNode, ....
     */
    ref_type: string;

    /**
     * eg. uuid
     */
    ref_id: string | null;

    data: T;

    expiring: boolean;

    expires_at: string;

    created_at: Date;

    updated_at: Date;
}
