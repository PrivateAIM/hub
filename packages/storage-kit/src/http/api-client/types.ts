/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput, IClient as IBaseClient } from 'hapic';
import type { IBucketAPI, IBucketFileAPI } from '../../domains';

/**
 * hapic's full construction surface, which — unlike `RequestBaseOptions` —
 * carries `transport`. That is what lets a test inject a `MemoryTransport`
 * (see `@privateaim/storage-kit/testing`) without touching the client.
 */
export type ClientOptions = ClientOptionsInput;

/**
 * Replaceable contract of the hub storage HTTP client. Implemented by
 * `APIClient`. Members are typed as INTERFACES rather than the concrete API
 * classes, so the type stays purely structural.
 */
export interface IStorageClient extends IBaseClient {
    readonly bucket : IBucketAPI;
    readonly bucketFile : IBucketFileAPI;
}
