/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput, IClient as IBaseClient } from 'hapic';
import type {
    DomainTypeMap,
    IBucketAPI,
    IBucketFileAPI,
    IEntityAPI,
} from '../../domains';
import type { ObjectLiteral } from '@rapiq/core';

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

    /**
     * A new client for the same base URL that authorizes every request with
     * `Authorization: Bearer <await resolve({ method })>`. The parent's hooks
     * and default headers are not carried over.
     */
    withAuthorization(
        resolve: StorageAuthorizationResolver,
        options?: StorageAuthorizationOptions,
    ) : IStorageClient;
}

export type StorageAuthorizationResolver = (request: { method: string }) => Promise<string>;

export type StorageAuthorizationOptions = {
    /**
     * Called when storage answers 401 or 403 to a request, so the caller can
     * drop the token it resolved for it. The error still propagates.
     */
    onRefused?: (request: { method: string }) => void
};

export type ClientEntityAPIKey = keyof IStorageClient & keyof DomainTypeMap;

/** Verbs are OPTIONAL — callers guard the ones they use. See core-http-kit. */
export type EntityAPIDispatch<T extends ObjectLiteral> = Partial<IEntityAPI<T, any, any>>;

export type ClientEntityAPIRegistry = {
    [K in ClientEntityAPIKey]: EntityAPIDispatch<DomainTypeMap[K]>
};
