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

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    actorId: string;

    actorType: string;

    // ------------------------------------------------------------------

    realmId: Realm['id'];

    // ------------------------------------------------------------------

    bucketId: Bucket['id'];

    bucket: Bucket;
}
