/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';

export type BucketClearCommandPayload = {
    id: string
};

export type BucketClearingFailedEventPayload = {
    id: string,
    error: Error
};

export type BucketClearingFinishedEventPayload = Bucket & {
    /**
     * ids of the bucket files removed by this clear;
     * files added concurrently are not part of it.
     */
    fileIds: string[]
};
