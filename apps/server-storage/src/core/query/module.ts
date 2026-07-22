/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createURLCodec } from '@rapiq/codec-url';
import type {
    ICondition,
    IQuery,
    ObjectLiteral,
    Schema,
} from '@rapiq/core';
import { Query, SchemaRegistry, isObject } from '@rapiq/core';
import { bucketSchema } from '../entities/bucket/schema.ts';
import { bucketFileSchema } from '../entities/bucket-file/schema.ts';
import type { DecodeQueryOptions } from './types.ts';

/**
 * Registry of every entity schema — the server-side allow-list layer.
 * Lives in core (persistence-agnostic): services consume it to decode wire
 * queries into the rapiq IR; the database module only executes the IR.
 */
export const schemaRegistry = new SchemaRegistry();

const schemas: Schema<any>[] = [
    bucketSchema,
    bucketFileSchema,
];

for (const schema of schemas) {
    schemaRegistry.add(schema);
}

/**
 * URL transport codec bound to the schema registry: decodes both the v2
 * expression dialect and legacy v1 bracket payloads.
 */
export const queryCodec = createURLCodec(schemaRegistry);

/**
 * Decode a raw wire query against a registered schema into the rapiq IR.
 */
export function decodeQuery<RECORD extends ObjectLiteral = ObjectLiteral>(
    input: unknown,
    options: DecodeQueryOptions<RECORD>,
): IQuery {
    const normalized = isObject(input) || typeof input === 'string' ? input : {};

    const parsed = queryCodec.decode(normalized, {
        schema: options.schema as Schema<any> | string,
        parameters: options.parameters,
    });

    return parsed ?? new Query({});
}

/**
 * Append server-derived conditions onto a decoded query by AND-wrapping its
 * filter tree (non-displaceable scope). Immutable.
 */
export function appendQueryConditions(query: IQuery, ...conditions: ICondition[]): Query {
    return new Query({
        fields: query.fields,
        filters: query.filters.and(...conditions),
        relations: query.relations,
        pagination: query.pagination,
        sorts: query.sorts,
    });
}
