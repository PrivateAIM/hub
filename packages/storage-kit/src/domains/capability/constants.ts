/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum StorageCapabilityType {
    BUCKET = 'bucket',
    BUCKET_FILE = 'bucket-file',
}

export enum StorageCapabilityAction {
    READ = 'read',
    WRITE = 'write',
    DELETE = 'delete',
}

export const STORAGE_CAPABILITY_AUDIENCE = 'storage';
export const STORAGE_CAPABILITY_QUERY_PARAMETER = 'dt';

/** Header tokens, in seconds. */
export const STORAGE_CAPABILITY_TOKEN_MAX_LIFETIME = 3600;
/** Tokens accepted from the query string (stream routes only), in seconds. */
export const STORAGE_CAPABILITY_URL_TOKEN_MAX_LIFETIME = 60;
