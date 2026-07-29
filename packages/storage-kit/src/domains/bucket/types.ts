/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '../bucket-file';
import type { EntityCollectionResponse, IEntityAPI } from '../types-base';
import type { Bucket } from './entity.ts';

export type BucketCreatePayload =    & Pick<Bucket, 'name'> &
    Partial<Pick<Bucket, 'region' | 'realm_id'>>;

export interface IBucketAPI extends IEntityAPI<Bucket, BucketCreatePayload, Partial<BucketCreatePayload>> {
    /**
     * Multi-file upload: a COLLECTION response, not a record envelope — one
     * request creates many bucket files.
     */
    upload(id: Bucket['id'], formData: FormData) : Promise<EntityCollectionResponse<BucketFile>>;

    getStreamPath(id: Bucket['id']) : string;
    getStreamURL(id: Bucket['id']) : string;
    stream(id: Bucket['id']) : Promise<ReadableStream<any>>;
}
