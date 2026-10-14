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
import {
    Query,
    SchemaRegistry,
    isObject,
} from '@rapiq/core';
import { eventSchema } from '../entities/event/schema.ts';
import { BadRequestError } from '@privateaim/errors';
import { collectRootFilterValues } from '@privateaim/server-kit';
import type { DecodeQueryOptions, LogFilters } from './types.ts';

/**
 * Registry of every entity schema — the server-side allow-list layer.
 * Lives in core (persistence-agnostic): services consume it to decode wire
 * queries into the rapiq IR; the database module only executes the IR.
 */
export const schemaRegistry = new SchemaRegistry();

/**
 * Every entity schema the registry knows about. Exported so
 * `test/unit/core/query/schema-entity-parity.spec.ts` can assert it covers ALL
 * of them — otherwise a schema added later would silently go unguarded.
 * Mirrors server-core's `entitySchemas`.
 */
export const entitySchemas: Schema<any>[] = [
    eventSchema,
];

for (const schema of entitySchemas) {
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

/**
 * Decode a wire query WITHOUT a schema (open) — accepts any filter key.
 * Used by the log endpoint, whose filters are dynamic VictoriaLogs labels
 * rather than a fixed entity allow-list.
 */
export function decodeQueryOpen(input: unknown): IQuery {
    const normalized = isObject(input) || typeof input === 'string' ? input : {};
    return queryCodec.decode(normalized) ?? new Query({});
}

/**
 * Turn a decoded log query into VictoriaLogs labels. A filter key may carry a
 * prefix (`labels.refId`), which is stripped, so the uniqueness
 * `collectRootFilterValues` guarantees for raw keys has to be re-checked on
 * the FINAL names: `labels.refId` and `x.refId` would otherwise collapse to
 * one label, last-wins — on the delete path, B's logs for a filter matching
 * nothing.
 */
export function collectLogFilters(query: IQuery, options: { extractTime?: boolean } = {}): LogFilters {
    const output: LogFilters = { labels: {} };

    for (const [key, value] of Object.entries(collectRootFilterValues(query))) {
        if (options.extractTime && key === 'time') {
            output.time = value;
            continue;
        }

        const index = key.indexOf('.');
        const label = index === -1 ? key : key.substring(index + 1);
        if (Object.hasOwn(output.labels, label)) {
            throw new BadRequestError(`The filter label '${label}' may only be specified once.`);
        }

        output.labels[label] = value;
    }

    return output;
}
