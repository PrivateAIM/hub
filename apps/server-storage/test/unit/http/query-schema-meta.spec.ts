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
import { createTestSuite } from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

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
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    it('should describe the full query vocabulary on a collection response', async () => {
        const client = suite.client();

        const { meta } = await client.bucket.getMany();

        // the repository meta survives alongside the description
        expect(meta.total).toBeDefined();

        expect(meta.schema).toBeDefined();
        expect(meta.schema.name).toEqual('bucket');
        // every hub schema opts into strict key validation
        expect(meta.schema.strict).toBe(true);
        expect(meta.schema.fields.default).toContain('name');
        expect(meta.schema.filters.allowed).toContain('name');
        expect(meta.schema.sort.allowed).toContain('createdAt');
        expect(meta.schema.pagination.maxLimit).toEqual(50);
        // bucketSchema omits `relations` entirely, so the normalized shape
        // reports nulls — the key itself is still present.
        expect(meta.schema.relations).toEqual({ allowed: null, schemas: null });
    });

    it('should report an undeclared field allow-list as null', async () => {
        const client = suite.client();

        const { meta } = await client.bucket.getMany();

        // bucketSchema declares `fields.default` only: `null` means the
        // allow-list was never declared (the default projection applies), NOT
        // that nothing is allowed.
        expect(meta.schema.fields.allowed).toBeNull();
        expect(meta.schema.fields.default).toContain('region');
    });

    it('should reference relation vocabulary by target schema instead of expanding it', async () => {
        const client = suite.client();

        const { meta } = await client.bucketFile.getMany();

        expect(meta.schema.name).toEqual('bucketFile');
        expect(meta.schema.relations).toEqual({
            allowed: ['bucket'],
            schemas: { bucket: 'bucket' },
        });
        // the file's own vocabulary stays flat — no dotted keys leak in
        expect(meta.schema.filters.allowed.every((key) => !key.includes('.'))).toBe(true);
    });

    it('should restrict a record response to the parameters a single read processes', async () => {
        const client = suite.client();

        const { data: entity } = await client.bucket.create(createTestBucket());

        const { meta } = await client.bucket.getOne(entity.id);

        expect(meta.schema).toBeDefined();
        expect(meta.schema.name).toEqual('bucket');
        expect(meta.schema.strict).toBe(true);
        expect(meta.schema.fields).toBeDefined();
        expect(meta.schema.relations).toBeDefined();
        // a record read processes neither filters, nor sort, nor pagination —
        // the keys are ABSENT from the description, not normalized to null
        expect(meta.schema.filters).toBeUndefined();
        expect(meta.schema.sort).toBeUndefined();
        expect(meta.schema.pagination).toBeUndefined();

        await client.bucket.delete(entity.id);
    });

    it('should not describe mutations', async () => {
        const client = suite.client();

        const created = await client.bucket.create(createTestBucket());
        expect(created.meta).toEqual({});

        const updated = await client.bucket.update(created.data.id, { region: 'eu-west' });
        expect(updated.meta).toEqual({});

        const deleted = await client.bucket.delete(created.data.id);
        expect(deleted.meta).toEqual({});
    });
});
