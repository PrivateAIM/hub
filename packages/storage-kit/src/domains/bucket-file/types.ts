/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IEntityAPI } from '../types-base';
import type { BucketFile } from './entity';

/**
 * Bucket files are created by uploading to their bucket, so `create`/`update`
 * take an open record rather than a named payload type.
 */
export interface IBucketFileAPI extends IEntityAPI<BucketFile, Record<string, any>, Record<string, any>> {
    getStreamPath(id: BucketFile['id']) : string;
    getStreamURL(id: BucketFile['id']) : string;
    stream(id: BucketFile['id']) : Promise<ReadableStream<any>>;
}
