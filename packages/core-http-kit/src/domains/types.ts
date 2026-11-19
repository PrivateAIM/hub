/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral, SchemaDescription } from '@rapiq/core';
import type { EntityQueryInput } from '../utils';

/**
 * Response-scoped extras of an entity-record response. `schema` is the
 * endpoint's queryable vocabulary — the static allow-list upper bound;
 * relation capabilities are referenced by target schema name
 * (`relations.schemas`) instead of being expanded inline, so nested
 * vocabulary is looked up on that entity's own endpoints.
 */
export type EntityRecordMeta = Record<string, any> & {
    schema?: SchemaDescription,
};

/**
 * The wire shape of every entity-record response: the record under
 * `data`, response-scoped extras under `meta` (mirroring
 * `EntityCollectionResponse`).
 */
export type EntityRecordResponse<R, M extends Record<string, any> = EntityRecordMeta> = {
    data: R,
    meta: M,
};

export type EntityCollectionResponse<R> = {
    data: R[],
    meta: {
        /**
         * The pagination actually applied by the server. Optional: a rapiq
         * adapter only reports back what it applied, mirroring
         * `EntityRepositoryPaginationMeta` on the server side.
         */
        limit?: number,
        offset?: number,
        total: number,
        schema?: SchemaDescription,
    }
};

export type CollectionResourcePage = {
    limit: number,
    offset: number
};

export type CollectionResourceFetcher<R> = (
    page: CollectionResourcePage,
) => Promise<EntityCollectionResponse<R>>;

export type DomainEntityWithID = {
    [key: string]: any,
    id: any
};
export type DomainEntityID<T> = T extends DomainEntityWithID ?
    T['id'] :
    never;

/**
 * Per-call request options, the trailing argument of every api method:
 * `signal` aborts the call, `timeout` (milliseconds) overrides the
 * client's own for this call. Absent, the client defaults apply.
 */
export type APIRequestOptions = {
    signal?: AbortSignal,
    timeout?: number,
};

/**
 * Contract of an entity API that has no update verb. `TCreate` carries the
 * endpoint's named create payload (e.g. `AnalysisBucketCreatePayload`); it
 * defaults to `Partial<T>` so every existing positional use stays
 * source-compatible.
 */
export interface IEntityAPISlim<T extends ObjectLiteral, TCreate = Partial<T>> {
    getMany(record?: EntityQueryInput<T>, options?: APIRequestOptions) : Promise<EntityCollectionResponse<T>>;
    getOne(
        id: DomainEntityID<T>,
        record?: EntityQueryInput<T>,
        options?: APIRequestOptions,
    ) : Promise<EntityRecordResponse<T>>;
    delete(id: DomainEntityID<T>, options?: APIRequestOptions) : Promise<EntityRecordResponse<T>>;
    create(data: TCreate, options?: APIRequestOptions) : Promise<EntityRecordResponse<T>>;
}

export interface IEntityAPI<T extends ObjectLiteral, TCreate = Partial<T>, TUpdate = Partial<T>> extends IEntityAPISlim<T, TCreate> {
    update(id: DomainEntityID<T>, data: TUpdate, options?: APIRequestOptions) : Promise<EntityRecordResponse<T>>;
}
