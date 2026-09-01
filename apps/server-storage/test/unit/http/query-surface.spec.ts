/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createAdminAuthorizationHeader } from '@privateaim/server-test-kit';
import type { Schema } from '@rapiq/core';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import {
    bucketFileSchema,
    bucketSchema,
} from '../../../src/core/index.ts';
import { createTestSuite } from '../../utils/index.ts';

const PROBE_UUID = '11111111-1111-1111-1111-111111111111';

/**
 * One probe value per allow-listed filter key, typed for the backing column:
 * uuid columns get a valid uuid (postgres rejects a non-uuid bind with a
 * driver error that would surface as a 500, not a 400), varchars get a bare
 * string. Keys are DERIVED from `describe()`, so widening an allow-list
 * without adding a probe value here fails loudly instead of silently
 * shrinking the probe surface.
 */
const FILTER_PROBE_VALUES: Record<string, Record<string, string>> = {
    bucket: {
        id: PROBE_UUID,
        name: 'probe',
        realmId: PROBE_UUID,
        actorType: 'robot',
        actorId: PROBE_UUID,
    },
    bucketFile: {
        id: PROBE_UUID,
        name: 'probe',
        directory: 'probe',
        realmId: PROBE_UUID,
        actorType: 'robot',
        actorId: PROBE_UUID,
        bucketId: PROBE_UUID,
    },
};

/**
 * [collection path, schema, a real-but-disallowed filter key]. The disallowed
 * key is a genuine entity column that is absent from `filters.allowed`, so the
 * rejection under test is the allow-list, not a nonexistent-column error.
 */
const TARGETS: [string, Schema<any>, string][] = [
    ['/buckets', bucketSchema, 'region'],
    ['/bucket-files', bucketFileSchema, 'hash'],
];

/**
 * The missing half of the parity/invariant guard (issue #1842): the
 * schema-entity parity spec proves every allow-listed key leads a declared,
 * entity-backed index — this one proves the policy holds END TO END over HTTP,
 * where `indexed: 'anchor'` filters and `indexed: true` sorts are enforced at
 * decode time. Every advertised key must round-trip 200; a single-key filter
 * that answered 400 would mean the declarations reject a query the
 * allow-lists permit. Only FILTERS can surface drift as a 400: sorts fail
 * SOFT under drop mode — a sort key that stops leading a declared index is
 * silently replaced by the schema's sort defaults, still 200 — so the sort
 * probes prove only that the ORDER BY executes. The binding-level
 * (row-comes-back) exemplar is
 * `apps/server-telemetry/test/unit/http/event-query-surface.spec.ts`.
 *
 * The disallowed probe uses the v2 expression dialect deliberately: under it
 * a disallowed key is a structural parse failure (ParseError → 400 via
 * `sanitizeError`), whereas the legacy bracket form silently DROPS unknown
 * keys — a bracket probe would answer 200 and prove nothing.
 */
describe('src/adapters/http/controllers (query surface)', () => {
    const suite = createTestSuite();
    let authorization: string;

    beforeAll(async () => {
        await suite.up();
        authorization = await createAdminAuthorizationHeader();
    });

    afterAll(async () => {
        await suite.down();
    });

    let baseURL: string;

    function getBaseURL() {
        if (!baseURL) {
            baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
        }
        return baseURL;
    }

    describe.each(TARGETS)('%s', (path, schema, disallowedKey) => {
        const description = schema.describe();
        const { name } = description;

        it('should declare probe values for exactly the allowed filter keys', () => {
            // Both directions: an allowed key without a probe value fails
            // loudly below, and a stale probe entry whose key left the
            // allow-list fails here instead of silently rotting unused.
            expect(Object.keys(FILTER_PROBE_VALUES[name] || {}).sort())
                .toEqual([...description.filters?.allowed || []].sort());
        });

        it('should accept every advertised filter key', async () => {
            const allowed = description.filters?.allowed || [];
            expect(allowed.length).toBeGreaterThan(0);

            for (const key of allowed) {
                const value = FILTER_PROBE_VALUES[name]?.[key];
                expect(value, `no probe value declared for ${name}.${key}`).toBeDefined();

                const response = await fetch(
                    `${getBaseURL()}${path}?filter[${key}]=${encodeURIComponent(value)}`,
                    { headers: { Authorization: authorization } },
                );

                expect(response.status, `filter[${key}]`).toBe(200);
            }
        });

        it('should accept every advertised sort key', async () => {
            const allowed = description.sorts?.allowed || [];
            expect(allowed.length).toBeGreaterThan(0);

            for (const key of allowed) {
                const response = await fetch(
                    `${getBaseURL()}${path}?sort=${encodeURIComponent(key)}`,
                    { headers: { Authorization: authorization } },
                );

                expect(response.status, `sort=${key}`).toBe(200);
            }
        });

        it('should reject a disallowed filter key with 400', async () => {
            // negative control on the control itself: the key must be a real
            // column-backed field (it is projected by default), just not
            // filterable — otherwise this pins a typo, not the allow-list
            expect(description.fields?.default).toContain(disallowedKey);
            expect(description.filters?.allowed).not.toContain(disallowedKey);

            const filter = encodeURIComponent(`eq(${disallowedKey},'probe')`);
            const response = await fetch(
                `${getBaseURL()}${path}?codec=url-expression&filter=${filter}`,
                { headers: { Authorization: authorization } },
            );

            expect(response.status).toBe(400);
        });
    });
});
