/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { Bucket } from '../bucket';

export interface BucketFile {
    id: string;

    name: string;

    path: string;

    hash: string;

    directory: string;

    size: number | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    actor_id: string;

    actor_type: string;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    // ------------------------------------------------------------------

    bucket_id: Bucket['id'];

    bucket: Bucket;
}
