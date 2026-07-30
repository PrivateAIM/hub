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
import { createTestApplication } from '../../app';
import { createTestNode } from '../../utils/domains';

// Every query-capable GET carries the endpoint's queryable vocabulary under
// meta.schema — the static allow-list upper bound, with relation capabilities
// REFERENCED by target schema name instead of being expanded inline (nested
// vocabulary is looked up on that entity's own endpoints).
//
// The description is shape-normalized: every described parameter carries every
// constraint key, where `null` means "never declared, the fallback applies" and
// an empty array means "explicitly nothing".
describe('src/adapters/http/controllers/entities (query schema meta)', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should describe the full query vocabulary on a collection response', async () => {
        const { meta } = await suite.client.node.getMany();

        // the repository meta survives alongside the description
        expect(meta.total).toBeDefined();

        expect(meta.schema).toBeDefined();
        expect(meta.schema.name).toEqual('node');
        // every hub schema opts into strict key validation
        expect(meta.schema.strict).toBe(true);
        expect(meta.schema.fields.allowed).toContain('name');
        expect(meta.schema.filters.allowed).toContain('name');
        expect(meta.schema.sort.allowed).toContain('name');
        expect(meta.schema.pagination.maxLimit).toEqual(50);
        // deep-equal pins the referenced-not-expanded relation contract
        expect(meta.schema.relations).toEqual({
            allowed: ['registryProject', 'registry'],
            schemas: { registryProject: 'registryProject', registry: 'registry' },
        });
    });

    it('should restrict a record response to the parameters a single read processes', async () => {
        const { data: entity } = await suite.client.node.create(createTestNode());

        const { meta } = await suite.client.node.getOne(entity.id);

        expect(meta.schema).toBeDefined();
        expect(meta.schema.name).toEqual('node');
        expect(meta.schema.strict).toBe(true);
        expect(meta.schema.fields).toBeDefined();
        expect(meta.schema.relations).toBeDefined();
        // a record read processes neither filters, nor sort, nor pagination —
        // the keys are ABSENT from the description, not normalized to null
        expect(meta.schema.filters).toBeUndefined();
        expect(meta.schema.sort).toBeUndefined();
        expect(meta.schema.pagination).toBeUndefined();

        await suite.client.node.delete(entity.id);
    });

    it('should reference relation vocabulary by target schema instead of expanding it', async () => {
        const { meta } = await suite.client.projectNode.getMany();

        expect(meta.schema.relations).toEqual({
            allowed: ['node', 'project'],
            schemas: { node: 'node', project: 'project' },
        });
        // the junction's own vocabulary stays flat — no dotted keys leak in
        expect(meta.schema.filters.allowed.every((key) => !key.includes('.'))).toBe(true);
    });

    it('should report an undeclared relation allow-list as null', async () => {
        const { meta } = await suite.client.registry.getMany();

        // registrySchema omits `relations` entirely, so the normalized shape
        // reports nulls — the key itself is still present. No hub schema pins an
        // explicitly empty allow-list, which would read `{ allowed: [], schemas: {} }`.
        expect(meta.schema.relations).toEqual({ allowed: null, schemas: null });
    });

    it('should report an undeclared field allow-list as null and derive sort from its default', async () => {
        const { meta } = await suite.client.masterImage.getMany();

        // masterImageSchema declares `fields.default` only: `null` means the
        // allow-list was never declared (the default projection applies), NOT
        // that nothing is allowed.
        expect(meta.schema.fields.allowed).toBeNull();
        expect(meta.schema.fields.default).toContain('path');

        // sort derives its allow-list from the declared default
        expect(meta.schema.sort).toEqual({ allowed: ['path'], default: { path: 'ASC' } });
    });

    it('should not describe mutations', async () => {
        const created = await suite.client.node.create(createTestNode());
        expect(created.meta).toEqual({});

        const updated = await suite.client.node.update(created.data.id, { hidden: true });
        expect(updated.meta).toEqual({});

        const deleted = await suite.client.node.delete(created.data.id);
        expect(deleted.meta).toEqual({});
    });
});
