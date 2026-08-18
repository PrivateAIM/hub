/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildQueryString } from '@privateaim/core-http-kit';
import {
    FilterCompoundOperator,
    ParseError,
    eq,
    isFilter,
    or,
} from '@rapiq/core';
import type { Node } from '@privateaim/core-kit';
import { describe, expect, it } from 'vitest';
import { nodeSchema } from '../../../../src/core/entities/node/schema.ts';
import { decodeQuery } from '../../../../src/core/query/index.ts';

// The full wire contract between hub's HTTP clients and its servers: the
// client kits encode via `buildQueryString` (plain URL codec, v2 expression
// dialect), the server decodes via the schema-registry-bound codec in
// `decodeQuery`. These tests drive both halves against each other, so a
// dialect or IR change in either @rapiq/codec-url or @rapiq/core surfaces
// here instead of in a running deployment.
//
// `buildQueryString` returns a `?`-prefixed string; the slice(1) mirrors
// transport, where only the part after `?` reaches the server's query parser.

const roundTrip = (input: Parameters<typeof buildQueryString<Node>>[0]) => {
    const encoded = buildQueryString<Node>(input);
    return decodeQuery(encoded.slice(1), { schema: nodeSchema });
};

describe('core/query codec round trip', () => {
    it('returns an empty string for empty input', () => {
        expect(buildQueryString()).toEqual('');
    });

    it('stamps the expression dialect in-band', () => {
        // The stamp is what lets the server-side codec dispatch v2 payloads
        // while still decoding legacy v1 bracket payloads from old clients.
        const encoded = buildQueryString<Node>({ filters: { name: 'x' } });
        expect(encoded).toContain('codec=url-expression');
    });

    it('round-trips typed build input across every parameter', () => {
        const query = roundTrip({
            filters: { name: 'x' },
            fields: ['id', 'name'],
            sorts: { createdAt: 'DESC' },
            pagination: { limit: 5 },
        });

        expect(query.filters.value).toHaveLength(1);
        expect(query.filters.value[0]).toMatchObject({ field: 'name', value: 'x' });
        expect(query.fields.value.map((field) => field.name)).toEqual(['id', 'name']);
        expect(query.sorts.value).toEqual([{ name: 'createdAt', operator: 'DESC' }]);
        expect(query.pagination.limit).toEqual(5);
    });

    it('round-trips a compound condition tree built with the helpers', () => {
        const query = roundTrip({ filters: or(eq('name', 'a'), eq('name', 'b')) });

        expect(query.filters.operator).toEqual(FilterCompoundOperator.OR);
        const leaves = query.filters.value.filter(isFilter);
        expect(leaves).toHaveLength(2);
        expect(leaves.map((leaf) => leaf.value)).toEqual(['a', 'b']);
    });

    it('clamps the requested limit to the schema pagination bound', () => {
        const query = roundTrip({ pagination: { limit: 500 } });

        expect(query.pagination.limit).toEqual(nodeSchema.pagination.maxLimit);
    });

    it('rejects a filter key outside the allow-list in the expression dialect', () => {
        // `publicKey` is a readable Node field but not a permitted filter.
        // The two wire dialects diverge here, and both outcomes are pinned:
        // the v2 expression dialect (what buildQueryString emits) resolves
        // paths strictly and rejects the key with a typed ParseError (wire:
        // 400 via sanitizeError) ...
        //
        // Since @rapiq/core 2.2 a parse no longer stops at the first
        // violation: it records every one and raises a single aggregate
        // ParseError (code `inputRejected`) carrying the whole trace on
        // `issues`. The per-parameter subclass (FiltersParseError) is what
        // the trace names, not what is thrown, so assert on the base class
        // plus the issue — asserting the subclass would pass vacuously
        // against any ParseError once rapiq changes the aggregation again.
        expect(() => roundTrip({ filters: { publicKey: 'x' } }))
            .toThrowError(ParseError);

        let raised: unknown;
        try {
            roundTrip({ filters: { publicKey: 'x' } });
        } catch (e) {
            raised = e;
        }

        expect(raised).toBeInstanceOf(ParseError);
        expect((raised as ParseError).issues).toEqual([
            expect.objectContaining({
                code: 'keyNotAllowed',
                path: ['publicKey'],
                meta: expect.objectContaining({ parameter: 'filters', key: 'publicKey' }),
            }),
        ]);
    });

    it('accepts the deprecated sort build-input key alongside the canonical sorts', () => {
        // rapiq 2.1 made `sorts` canonical and kept `sort` as a deprecated
        // alias, removed in 3.0. hub's own callers were migrated, but
        // client-vue and the HTTP kits are published, so a consumer still
        // spelling it `sort` must keep working — and the URL parameter it
        // encodes to is `sort` either way.
        const encoded = buildQueryString<Node>({ sort: { createdAt: 'DESC' } });
        expect(encoded).toContain('sort=');

        const query = decodeQuery(encoded.slice(1), { schema: nodeSchema });
        expect(query.sorts.value).toEqual([{ name: 'createdAt', operator: 'DESC' }]);
    });

    it('prunes a filter key outside the allow-list in the legacy bracket dialect', () => {
        // ... while the legacy v1 bracket/object form stays lenient and
        // drops the key silently, so pre-v2 clients keep working. Either
        // way the key never reaches the database layer.
        const query = decodeQuery({ filter: { publicKey: 'x' } }, { schema: nodeSchema });

        expect(query.filters.value).toHaveLength(0);
    });
});
