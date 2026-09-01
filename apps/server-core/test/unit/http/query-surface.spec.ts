/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { buildQueryString } from '@privateaim/core-http-kit';
import {
    FilterCompoundOperator,
    contains,
    defineQuery,
    isFilter,
    or,
} from '@rapiq/core';
import { isClientErrorWithStatusCode } from 'hapic';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestApplication } from '../../app';
import { decodeQuery, entitySchemas, queryCodec } from '../../../src/core/index.ts';

/**
 * The wire-level half of the #1842 guard: the invariant spec
 * (`test/unit/core/query/schema-entity-parity.spec.ts`) proves every
 * allow-listed key is LEGAL under the indexed policies, this one proves it is
 * ACCEPTED end to end — a real authenticated GET per advertised filter and
 * sort key answers 200 through decode, anchor/prefix enforcement and SQL
 * execution with a type-valid bound parameter. Tables stay empty, so the
 * probes assert acceptance, not row selection; the binding-level
 * (row-comes-back) exemplar is
 * `apps/server-telemetry/test/unit/http/event-query-surface.spec.ts`.
 *
 * Only FILTERS can surface drift as a 400 here: an unanchored filter key is a
 * fatal decode error, because no hub schema declares `filters.default`. Sorts
 * fail SOFT under drop mode — a sort key that stops leading a declared index
 * is silently replaced by the schema's sort defaults, still 200 — so the sort
 * loop proves only that the ORDER BY executes; the decode-level block below
 * is what pins that no advertised sort key is dropped.
 *
 * Filters travel in the v2 expression dialect (`buildQueryString`) — the one
 * real clients emit, and the only one that rejects loudly: the legacy bracket
 * form prunes a disallowed key silently, so it could never probe the 400.
 */
const SCHEMA_ENDPOINTS: [string, string][] = [
    ['analysis', 'analyses'],
    ['analysisBucket', 'analysis-buckets'],
    ['analysisBucketFile', 'analysis-bucket-files'],
    ['analysisNode', 'analysis-nodes'],
    ['analysisNodeEvent', 'analysis-node-events'],
    ['masterImage', 'master-images'],
    ['masterImageGroup', 'master-image-groups'],
    ['node', 'nodes'],
    ['project', 'projects'],
    ['projectNode', 'project-nodes'],
    ['registry', 'registries'],
    ['registryProject', 'registry-projects'],
];

// A probe value must survive the column's TYPE, not only the allow-list: a
// non-uuid string bound against a postgres uuid column is a driver error
// (500), exactly the class of failure this spec exists to catch — so it must
// not inject one itself.
const BOOLEAN_KEYS = new Set(['root', 'online', 'hidden', 'configurationLocked']);

function buildFilterValue(key: string): string | boolean {
    if (key === 'id' || key.endsWith('Id')) {
        return randomUUID();
    }

    if (BOOLEAN_KEYS.has(key)) {
        return true;
    }

    return 'probe';
}

describe('src/adapters/http (query surface probes)', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const requestStatus = async (path: string): Promise<unknown> => suite.client
        .get(path)
        .then(() => 200, (error) => (isClientErrorWithStatusCode(error, 400) ? 400 : error));

    // SCHEMA_ENDPOINTS is hand-maintained, so without this a schema added
    // later would silently go unprobed rather than fail.
    it('should map every registered entity schema to an endpoint', () => {
        expect(SCHEMA_ENDPOINTS.map(([name]) => name).sort())
            .toEqual(entitySchemas.map((schema) => schema.name).sort());
    });

    it.each(SCHEMA_ENDPOINTS)('should accept every advertised %s filter and sort key', async (name, endpoint) => {
        const schema = entitySchemas.find((entry) => entry.name === name);
        const description = schema.describe();
        const offenders: string[] = [];

        // Anti-vacuity: an empty (or renamed-away) allow-list would run zero
        // probes and pass — every schema declares both lists non-empty.
        expect((description.filters?.allowed || []).length).toBeGreaterThan(0);
        expect((description.sorts?.allowed || []).length).toBeGreaterThan(0);

        for (const key of description.filters?.allowed || []) {
            const path = `${endpoint}${buildQueryString({ filters: { [key]: buildFilterValue(key) } })}`;
            const status = await requestStatus(path);
            if (status !== 200) {
                offenders.push(`filters.${key} -> ${status}`);
            }
        }

        for (const key of description.sorts?.allowed || []) {
            const status = await requestStatus(`${endpoint}?sort=-${key}`);
            if (status !== 200) {
                offenders.push(`sorts.${key} -> ${status}`);
            }
        }

        expect(offenders).toEqual([]);
    });

    it.each(SCHEMA_ENDPOINTS)('should reject a disallowed %s filter key with 400', async (_name, endpoint) => {
        const path = `${endpoint}${buildQueryString({ filters: { notQueryable: 'probe' } })}`;

        expect(await requestStatus(path)).toEqual(400);
    });
});

/**
 * Decode-level pins for what the wire probes above cannot see: sorts fail
 * SOFT (a dropped key is silently replaced by the schema defaults, still
 * 200), so only inspecting the decoded IR proves a sort key survives.
 */
describe('src/core/query (decode-level sort/filter pins)', () => {
    it('should keep every advertised single-key sort through decode', () => {
        const offenders: string[] = [];

        for (const schema of entitySchemas) {
            const description = schema.describe();
            const defaults = description.sorts?.default || {};

            for (const key of description.sorts?.allowed || []) {
                // Probe the direction OPPOSITE to the key's default entry: a
                // client entry matching the default's exact key+direction is
                // exempt from the index check, so probing with the default
                // would let a dropped key masquerade as the substituted
                // default.
                const direction = defaults[key] === 'DESC' ? 'ASC' : 'DESC';
                const wire = direction === 'DESC' ? `-${key}` : key;
                const query = decodeQuery(`sort=${encodeURIComponent(wire)}`, { schema });

                const bound = query.sorts.value
                    .some((sort) => sort.name === key && sort.operator === direction);
                if (!bound) {
                    offenders.push(`${schema.name}.sorts.${key}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });

    // The FSearch wire shape: client-vue's search box emits
    // or(contains(name), contains(displayName)) against /analyses and
    // /projects — the two schemas whose filter allow-lists carry both keys.
    // Under anchor mode every OR branch must anchor independently, so a
    // dropped branch would silently narrow the search to one field.
    it.each(['analysis', 'project'])('should keep both FSearch branches for %s through decode', (name) => {
        const schema = entitySchemas.find((entry) => entry.name === name);
        const filters = or(contains('name', 'probe'), contains('displayName', 'probe'));
        const encoded = queryCodec.encode(defineQuery<any>({ filters }));

        const query = decodeQuery(String(encoded), { schema });

        expect(query.filters.operator).toBe(FilterCompoundOperator.OR);
        expect(query.filters.value.filter(isFilter).map((condition) => condition.field))
            .toEqual(['name', 'displayName']);
    });

    it('should keep the dotted node.name sort on analysisNode through decode', () => {
        // FAnalysisNodesManager / FAnalysisNodeExecutionList sort by
        // `node.name`. The dotted key resolves through `schemaMapping` into
        // the node schema, whose ['name', 'realmId'] sequence it leads — a
        // reshuffle of the TARGET schema's indexes would drop it here,
        // silently un-sorting those views with every wire probe green.
        const schema = entitySchemas.find((entry) => entry.name === 'analysisNode');
        const query = decodeQuery(`sort=${encodeURIComponent('node.name')}`, { schema });

        expect(query.sorts.value.map((sort) => [sort.name, sort.operator]))
            .toEqual([['node.name', 'ASC']]);
    });
});
