/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { BucketFile } from '@privateaim/storage-kit';

export type BucketFileCreateCommandPayload = {
    meta: Partial<BucketFile>,
    data: Readable
};

export type BucketFileCreationFailedEventPayload = {
    id: string,
    error: Error
};

export type BucketFileCreationStartedEventPayload = Partial<Omit<BucketFile, 'bucket'>>;

export type BucketFileCreationFinishedEventPayload = Omit<BucketFile, 'bucket'>;
