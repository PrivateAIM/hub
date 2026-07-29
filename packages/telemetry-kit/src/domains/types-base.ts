/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SchemaDescription } from '@rapiq/core';
import type { Client, RequestBaseOptions } from 'hapic';

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

export type BaseAPIContext = {
    client?: Client | RequestBaseOptions
};
