/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIRequestOptions, IEntityAPI } from '../types';
import type { Realm } from '@authup/core-kit';
import type { Bucket } from '../bucket';

/**
 * Bucket files are created by uploading to their bucket, so `create`/`update`
 * take an open record rather than a named payload type.
 */
export interface IBucketFileAPI extends IEntityAPI<BucketFile, Record<string, any>, Record<string, any>> {
    getStreamPath(id: BucketFile['id']) : string;
    getStreamURL(id: BucketFile['id']) : string;
    /**
     * Sends `timeout: 0` unless `options.timeout` is set: the deadline would
     * keep running while the caller reads the body.
     */
    stream(id: BucketFile['id'], options?: APIRequestOptions) : Promise<ReadableStream<any>>;
}

export type BucketFile = {
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
};
