import {
    afterAll, 
    beforeAll, 
    describe, 
    expect, 
    it,
} from 'vitest';
import { MasterImageGroupEntity } from '../../src/adapters/database/entities/master-image-group.ts';
import { createTestDatabaseApplication } from '../app/factory.ts';
import type { TestApplication } from '../app/module.ts';

describe('date-to-iso-string transformer', () => {
    let app: TestApplication;

    beforeAll(async () => {
        app = createTestDatabaseApplication();
        await app.setup();
    });

    afterAll(async () => {
        await app.teardown();
    });

    it('hydrates created_at and updated_at as ISO strings on a fresh read', async () => {
        const repo = app.dataSource.getRepository(MasterImageGroupEntity);
        const saved = await repo.save(repo.create({
            name: 'g', 
            path: '/p', 
            virtual_path: '/vp', 
        }));
        const read = await repo.findOneByOrFail({ id: saved.id });

        expect(typeof read.created_at).toBe('string');
        expect(typeof read.updated_at).toBe('string');
        expect(Number.isNaN(new Date(read.created_at).getTime())).toBe(false);
        expect(Number.isNaN(new Date(read.updated_at).getTime())).toBe(false);
    });
});
