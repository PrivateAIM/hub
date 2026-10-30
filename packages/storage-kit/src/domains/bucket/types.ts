/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '../bucket-file';
import type { EntityCollectionResponse, EntityRecordResponse, IEntityAPI } from '../types';
import type { Realm } from '@authup/core-kit';

export type BucketCreatePayload =    & Pick<Bucket, 'name'> &
    Partial<Pick<Bucket, 'region' | 'realmId' | 'refType' | 'refId'>>;

export interface IBucketAPI extends IEntityAPI<Bucket, BucketCreatePayload, Partial<BucketCreatePayload>> {
    /**
     * Multi-file upload: a COLLECTION response, not a record envelope — one
     * request creates many bucket files.
     */
    upload(id: Bucket['id'], formData: FormData) : Promise<EntityCollectionResponse<BucketFile>>;

    /**
     * Empties the bucket (every file and stored object) but keeps it.
     */
    clear(id: Bucket['id']) : Promise<EntityRecordResponse<Bucket>>;

    getStreamPath(id: Bucket['id']) : string;
    getStreamURL(id: Bucket['id']) : string;
    stream(id: Bucket['id']) : Promise<ReadableStream<any>>;
}

export type Bucket = {
    id: string;

    name: string;

    region: string | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    actorId: string | null;

    actorType: string | null;

    // ------------------------------------------------------------------

    realmId: Realm['id'] | null;

    // ------------------------------------------------------------------

    /**
     * eg. analysis
     *
     * Deliberately free-form, mirroring telemetry-kit's `Event.refType`: the
     * vocabulary is whatever the creating service's own `DomainType` names,
     * and typing it here would make this Layer-0 package depend on core-kit.
     * Nullable — unlike an event, a bucket the HTTP `POST /buckets` route
     * creates directly has no natural owning resource to name.
     */
    refType: string | null;

    /**
     * eg. uuid
     */
    refId: string | null;

};
