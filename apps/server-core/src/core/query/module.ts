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
import { analysisSchema } from '../entities/analysis/schema.ts';
import { analysisBucketSchema } from '../entities/analysis-bucket/schema.ts';
import { analysisBucketFileSchema } from '../entities/analysis-bucket-file/schema.ts';
import { analysisNodeSchema } from '../entities/analysis-node/schema.ts';
import { analysisNodeEventSchema } from '../entities/analysis-node-event/schema.ts';
import { masterImageSchema } from '../entities/master-image/schema.ts';
import { masterImageGroupSchema } from '../entities/master-image-group/schema.ts';
import { nodeSchema } from '../entities/node/schema.ts';
import { projectSchema } from '../entities/project/schema.ts';
import { projectNodeSchema } from '../entities/project-node/schema.ts';
import { registrySchema } from '../entities/registry/schema.ts';
import { registryProjectSchema } from '../entities/registry-project/schema.ts';
import type { DecodeQueryOptions } from './types.ts';

/**
 * Registry of every entity schema — the server-side allow-list layer.
 * Relation traversal (e.g. an `analysis.name` filter) resolves through
 * the `schemaMapping` of the owning schema into the related schema's own
 * allow-lists.
 *
 * The registry deliberately lives in core (persistence-agnostic): the
 * schemas are security policy over the domain types, and services consume
 * them to decode wire queries into the rapiq IR. The database module only
 * executes the decoded IR; the allow-lists themselves stay explicit and are
 * never auto-derived from entity metadata.
 *
 * Because an allow-list entry is a bare string, the compiler checks it against
 * the domain type but never against the TypeORM column metadata. That gap is
 * closed by `test/unit/core/query/schema-entity-parity.spec.ts`, which runs
 * rapiq's `assertSchemaMatchesEntity` over every schema in this registry that
 * has a backing entity.
 */
export const schemaRegistry = new SchemaRegistry();

/**
 * Every entity schema the registry knows about. Exported so
 * `test/unit/core/query/schema-entity-parity.spec.ts` can assert it covers ALL
 * of them — otherwise a schema added later would silently go unguarded.
 *
 * Schema is invariant in its record type, so a heterogeneous registry of
 * Schema<Node> | Schema<Analysis> | ... can only be typed as Schema<any>[].
 */
export const entitySchemas: Schema<any>[] = [
    analysisSchema,
    analysisBucketSchema,
    analysisBucketFileSchema,
    analysisNodeSchema,
    analysisNodeEventSchema,
    masterImageSchema,
    masterImageGroupSchema,
    nodeSchema,
    projectSchema,
    projectNodeSchema,
    registrySchema,
    registryProjectSchema,
];

for (const schema of entitySchemas) {
    schemaRegistry.add(schema);
}

/**
 * URL transport codec bound to the schema registry: decodes both the v2
 * expression dialect (stamped or detected) and legacy v1 bracket payloads,
 * so pre-v2 clients keep working.
 */
export const queryCodec = createURLCodec(schemaRegistry);

/**
 * Decode a raw wire query (routup `useRequestQuery` output or a raw query
 * string) against a registered schema into the rapiq IR. The schema's
 * allow-lists, defaults and pagination bounds are applied here —
 * downstream consumers (repository adapters) only execute the returned
 * query.
 */
export function decodeQuery<RECORD extends ObjectLiteral = ObjectLiteral>(
    input: unknown,
    options: DecodeQueryOptions<RECORD>,
): IQuery {
    const normalized = isObject(input) || typeof input === 'string' ? input : {};

    const parsed = queryCodec.decode(normalized, {
        // Schema<RECORD> is invariant; the codec's non-generic options
        // accept Schema<ObjectLiteral>, so collapse the variance here.
        schema: options.schema as Schema<any> | string,
        parameters: options.parameters,
    });

    return parsed ?? new Query({});
}

/**
 * Append server-derived conditions (a route realm, an owner scope, ...)
 * onto a decoded query by AND-wrapping its filter tree. The wrap makes the
 * appended scope non-displaceable: a client-sent condition on the same
 * field intersects with the scope instead of replacing it, and compound
 * client trees (`or(...)`) are preserved as-is. Since @rapiq/core
 * 2.0.0-beta.19, `Filters.merge`/`mergeQueries` compose conjunctively too,
 * so no library merge path can displace it either. Same guarantee class as a
 * mandatory `andWhere` at the repository — expressed once in the IR.
 * Appended conditions do not pass through `decodeQuery`, so the schema
 * allow-lists do not constrain them (server-derived context).
 *
 * Immutable: returns a new `Query` whose filters node is the AND-wrapped
 * successor; every other parameter node is carried over by reference, so
 * the input query stays untouched.
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
