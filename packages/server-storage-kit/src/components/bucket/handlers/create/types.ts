/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';

export type BucketCreateCommandPayload = Partial<Bucket>;

export type BucketCreationFailedEventPayload = {
    id: string,
    error: Error
};

export type BucketCreationFinishedEventPayload = Bucket;
