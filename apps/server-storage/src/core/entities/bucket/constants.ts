/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';

/**
 * An identity read of a bucket (or its files) accepts any one of these,
 * each with realm reach onto the bucket's realm: holding a write implies read.
 */
export const BUCKET_READ_PERMISSIONS: string[] = [
    PermissionName.BUCKET_READ,
    PermissionName.BUCKET_UPDATE,
    PermissionName.BUCKET_DELETE,
];
