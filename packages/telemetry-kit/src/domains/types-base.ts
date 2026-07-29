/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral, SchemaDescription } from '@rapiq/core';
import type { IClient as IBaseClient, RequestBaseOptions } from 'hapic';
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


/**
 * Generic entity-API contracts, mirroring `@privateaim/core-http-kit`'s
 * `types-base.ts`. Kept as a per-kit copy rather than a shared import: this kit
 * sits BELOW core-http-kit in the dependency graph, so importing from it would
 * invert the layering.
 */
export type DomainEntityWithID = {
    [key: string]: any,
    id: any
};

export type DomainEntityID<T> = T extends DomainEntityWithID ?
    T['id'] :
    never;

export interface IEntityAPISlim<T extends ObjectLiteral, TCreate = Partial<T>> {
    getMany(record?: EntityQueryInput<T>) : Promise<EntityCollectionResponse<T>>;
    getOne(id: DomainEntityID<T>, record?: EntityQueryInput<T>) : Promise<EntityRecordResponse<T>>;
    delete(id: DomainEntityID<T>) : Promise<EntityRecordResponse<T>>;
    create(data: TCreate) : Promise<EntityRecordResponse<T>>;
}

export interface IEntityAPI<T extends ObjectLiteral, TCreate = Partial<T>, TUpdate = Partial<T>> extends IEntityAPISlim<T, TCreate> {
    update(id: DomainEntityID<T>, data: TUpdate) : Promise<EntityRecordResponse<T>>;
}

export type BaseAPIContext = {
    /**
     * hapic client INTERFACE, not its concrete class — see the identical note
     * in @privateaim/core-http-kit.
     */
    client?: IBaseClient | RequestBaseOptions
};
