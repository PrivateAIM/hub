/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

/**
 * The fields a free-text master-image search matches with `contains`. Both
 * are in server-core's `filters.allowed` for master images.
 */
export const MASTER_IMAGE_SEARCH_FIELDS = ['name', 'virtualPath'];

/**
 * The `component` log label the worker's master-image synchronizer writes
 * with. Mirrors `ComponentName.MASTER_IMAGE_SYNCHRONIZER` in
 * `@privateaim/server-core-worker-kit`, a server package the client does not
 * depend on.
 */
export const MASTER_IMAGE_SYNCHRONIZER_LOG_COMPONENT = 'masterImageSynchronizer';

export enum MasterImageStatusFilter {
    ALL = 'all',
    BUILT = 'built',
    BUILDING = 'building',
    FAILED = 'failed',
}
