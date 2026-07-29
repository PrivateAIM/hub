/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import type { Event } from '@privateaim/telemetry-kit';
import { LogChannel, LogLevel } from '@privateaim/telemetry-kit';
import { createTestSuite } from '../../utils';

// Every query-capable GET carries the endpoint's queryable vocabulary under
// meta.schema — the static allow-list upper bound, with relation capabilities
// REFERENCED by target schema name instead of being expanded inline (nested
// vocabulary is looked up on that entity's own endpoints).
//
// The description is shape-normalized: every described parameter carries every
// constraint key, where `null` means "never declared, the fallback applies" and
// an empty array means "explicitly nothing".
describe('src/adapters/http/controllers (query schema meta)', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const eventPayload: Partial<Event> = {
        scope: 'model',
        name: 'updated',
        ref_type: 'project',
        ref_id: '4b324d99-1984-4081-a47d-10e809092075',
    };

    it('should describe the full query vocabulary on a collection response', async () => {
        const client = suite.client();

        const { meta } = await client.event.getMany();

        // the repository meta survives alongside the description
        expect(meta.total).toBeDefined();

        expect(meta.schema).toBeDefined();
        expect(meta.schema.name).toEqual('event');
        // every hub schema opts into strict key validation
        expect(meta.schema.strict).toBe(true);
        expect(meta.schema.filters.allowed).toContain('name');
        expect(meta.schema.sort.allowed).toContain('created_at');
        expect(meta.schema.pagination.maxLimit).toEqual(50);
        // eventSchema omits `relations` entirely, so the normalized shape
        // reports nulls — the key itself is still present.
        expect(meta.schema.relations).toEqual({ allowed: null, schemas: null });
    });

    it('should report a completely undeclared fields block as null', async () => {
        const client = suite.client();

        const { meta } = await client.event.getMany();

        // eventSchema declares no `fields` block at all: `null` on both
        // constraints means "never declared, the fallback applies", NOT that
        // nothing is projectable.
        expect(meta.schema.fields).toEqual({ default: null, allowed: null });
    });

    it('should restrict a record response to the parameters a single read processes', async () => {
        const client = suite.client();

        const { data: entity } = await client.event.create(eventPayload);

        const { meta } = await client.event.getOne(entity.id);

        expect(meta.schema).toBeDefined();
        expect(meta.schema.name).toEqual('event');
        expect(meta.schema.strict).toBe(true);
        expect(meta.schema.fields).toBeDefined();
        expect(meta.schema.relations).toBeDefined();
        // a record read processes neither filters, nor sort, nor pagination —
        // the keys are ABSENT from the description, not normalized to null
        expect(meta.schema.filters).toBeUndefined();
        expect(meta.schema.sort).toBeUndefined();
        expect(meta.schema.pagination).toBeUndefined();

        await client.event.delete(entity.id);
    });

    it('should not describe the schemaless log collection', async () => {
        const client = suite.client();

        await client.log.create({
            message: 'query schema meta probe',
            level: LogLevel.INFORMATIONAL,
            service: 'test-service',
            channel: LogChannel.HTTP,
            labels: { query_schema_meta: 'probe' },
        });

        const { meta } = await client.log.getMany({ filters: { labels: { query_schema_meta: 'probe' } } });

        expect(meta.total).toBeDefined();
        // GET /logs is decoded with decodeQueryOpen() — its filters are dynamic
        // VictoriaLogs labels rather than a declared rapiq vocabulary, so it is
        // the one collection endpoint that deliberately advertises nothing.
        expect(meta.schema).toBeUndefined();
    });

    it('should not describe mutations', async () => {
        const client = suite.client();

        const created = await client.event.create(eventPayload);
        expect(created.meta).toEqual({});

        const deleted = await client.event.delete(created.data.id);
        expect(deleted.meta).toEqual({});

        // POST /logs is record-shaped too and carries the envelope with an
        // empty meta, even though no rapiq schema exists for `Log`.
        const log = await client.log.create({
            message: 'query schema meta mutation probe',
            level: LogLevel.INFORMATIONAL,
            service: 'test-service',
            channel: LogChannel.HTTP,
        });
        expect(log.meta).toEqual({});
        expect(log.data.message).toEqual('query schema meta mutation probe');
    });
});
