/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import {
    and,
    contains,
    defineQuery,
    inArray,
} from '@rapiq/core';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createAdminAuthorizationHeader } from '@privateaim/server-test-kit';
import { eventSchema, queryCodec } from '../../../src/core/index.ts';
import { createTestSuite } from '../../utils';

/**
 * The missing half of the indexed-invariant guard (#1842): the parity spec
 * proves a query is LEGAL, this one proves the wire agrees. Every allowed
 * filter and sort key answers 200 end to end, and a key removed from the
 * allow-lists answers 400 — pinning that the timestamp-filter removal
 * (`createdAt` was filterable before this) is wire-visible, via the
 * expression dialect, whose decode throws `keyNotAllowed` where the legacy
 * bracket dialect drops silently.
 */
describe('event HTTP query surface', () => {
    const suite = createTestSuite();
    let baseURL: string;
    let authorization: string;

    let createdId: string;
    let createdRealmId: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
        authorization = await createAdminAuthorizationHeader();

        const { data } = await suite.client().event.create({
            scope: 'entity',
            name: 'updated',
            refType: 'project',
            refId: '4b324d99-1984-4081-a47d-10e809092075',
            expiring: false,
        });

        createdId = data.id;
        createdRealmId = data.realmId;
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const getEvents = (queryString: string) => fetch(`${baseURL}/events?${queryString}`, {
        method: 'GET',
        headers: { Authorization: authorization },
    });

    describe('allowed filter keys', () => {
        // Two probe values per allowed key: one matching the seeded event and
        // one guaranteed miss. Together they prove the filter BINDS — the
        // created row comes back for the match AND is excluded by the miss —
        // where the matching probe alone would also pass against an
        // unfiltered listing.
        const filterProbes: Record<string, () => string> = {
            scope: () => 'entity',
            name: () => 'updated',
            refType: () => 'project',
            refId: () => '4b324d99-1984-4081-a47d-10e809092075',
            realmId: () => createdRealmId,
        };

        const filterMisses: Record<string, () => string> = {
            scope: () => 'no-such-scope',
            name: () => 'no-such-name',
            refType: () => 'no-such-type',
            refId: () => randomUUID(),
            realmId: () => randomUUID(),
        };

        it('should probe exactly the allowed filter keys', () => {
            const description = eventSchema.describe();
            expect(Object.keys(filterProbes).sort())
                .toEqual([...description.filters?.allowed || []].sort());
            expect(Object.keys(filterMisses).sort())
                .toEqual([...description.filters?.allowed || []].sort());
        });

        it.each(Object.keys(filterProbes))('should answer 200 for a filter on %s', async (key) => {
            const expression = `eq(${key},'${filterProbes[key]()}')`;
            const response = await getEvents(`filter=${encodeURIComponent(expression)}`);

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data.map((entry: { id: string }) => entry.id)).toContain(createdId);
        });

        it.each(Object.keys(filterMisses))('should exclude the seeded event for a non-matching %s filter', async (key) => {
            // Race-safe under the shared database: assert absence of the
            // seeded id, never meta.total or data.length — sibling suites
            // write their own rows concurrently.
            const expression = `eq(${key},'${filterMisses[key]()}')`;
            const response = await getEvents(`filter=${encodeURIComponent(expression)}`);

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data.map((entry: { id: string }) => entry.id)).not.toContain(createdId);
        });
    });

    describe('sorts', () => {
        it('should advertise createdAt as the only sort key', () => {
            // Pins both the updatedAt/expiresAt removal and that no key is
            // silently added without a wire probe here — sorts fail SOFT, so
            // only the description itself can make list drift visible.
            expect(eventSchema.describe().sorts?.allowed).toEqual(['createdAt']);

            // The default is the soft-failure floor: it is what every dropped
            // sort parameter silently degrades to, so it must stay newest-first
            // (the admin events page's order), not vanish back to unsorted.
            expect(eventSchema.describe().sorts?.default).toEqual({ createdAt: 'DESC' });
        });

        it('should answer 200 for the allowed createdAt sort', async () => {
            const response = await getEvents('sort=-createdAt');

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data.map((entry: { id: string }) => entry.id)).toContain(createdId);
        });

        it('should fail soft on a no-longer-allowed sort key', async () => {
            // `updatedAt` was sortable before #1842. Sorts fail SOFT: the
            // whole parameter is silently replaced by the schema's
            // `createdAt DESC` default, so the rows come back newest-first —
            // deliberately not a 400, unlike the filter below.
            const response = await getEvents('sort=-updatedAt');

            expect(response.status).toBe(200);
        });
    });

    describe('disallowed filter keys', () => {
        it('should answer 400 for a filter on createdAt', async () => {
            // Pins the timestamp-filter removal: `createdAt` sits behind
            // `dateToISOStringTransformer`, so a WHERE bind would compare an
            // ISO string against native datetime storage — the key is gone
            // from the allow-list and the expression dialect rejects it.
            const expression = "eq(createdAt,'2026-01-01T00:00:00.000Z')";
            const response = await getEvents(`filter=${encodeURIComponent(expression)}`);

            expect(response.status).toBe(400);

            // the rapiq parse trace is forwarded, naming the offending key
            const body = await response.json();
            expect(JSON.stringify(body)).toContain('createdAt');
        });
    });

    describe('admin list search shape', () => {
        it('should decode the realm-scoped name search end to end', async () => {
            // The exact shape the admin events page sends (realm switcher +
            // FSearch), through the real encoder: under anchor mode EVERY
            // branch of the AND group may anchor independently, and the
            // bare `-createdAt` sort needs the createdAt single — this is
            // the query the whole index surface exists for.
            const encoded = queryCodec.encode(defineQuery<any>({
                filters: and(inArray('realmId', [createdRealmId, null]), contains('name', 'upd')),
                sorts: ['-createdAt'],
            }));
            expect(encoded).toBeTruthy();

            const response = await getEvents(String(encoded));

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data.map((entry: { id: string }) => entry.id)).toContain(createdId);
        });
    });
});
