/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';

export interface Bucket {
    id: string;

    name: string;

    region: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    actor_id: string;

    actor_type: string;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

}
