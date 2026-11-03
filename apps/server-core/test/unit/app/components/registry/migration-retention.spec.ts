/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HarborClient } from '@hapic/harbor';
import { MemoryTransport } from 'hapic';
import { describe, expect, it } from 'vitest';
import { collectRegistryMigrationRetainedProjectIds } from '../../../../../src/app/components/registry/handlers/helpers/migration-retention.ts';

const marker = {
    kind: 'privateaim-registry-project-migration',
    version: 1,
    registryId: 'registry',
    registryProjectId: 'project',
    sourceExternalName: 'old',
    sourceExternalId: '11',
    targetExternalName: 'new',
    targetExternalId: '12',
};

function createClient(robots: Array<{
    id: number, 
    name: string, 
    description?: string 
}>, failPage?: number) {
    const pages: number[] = [];
    const transport = new MemoryTransport({
        fetch(request) {
            const url = new URL(request.url);

            expect(request.method).toBe('GET');
            expect(url.pathname).toBe('/api/v2.0/robots');

            const page = Number(url.searchParams.get('page'));
            const size = Number(url.searchParams.get('page_size'));

            pages.push(page);

            return page === failPage ?
                { status: 503, body: { message: 'unavailable' } } :
                { status: 200, body: robots.slice((page - 1) * size, page * size) };
        },
    });

    return { client: new HarborClient({ request: { baseURL: 'http://harbor/api/v2.0/', transport } }), pages };
}

describe('registry migration retention', () => {
    it('reads all robot pages and retains both numeric project identities', async () => {
        const robots = Array.from({ length: 100 }, (_, id) => ({ id, name: `ordinary-${id}` }));
        const harbor = createClient([
            ...robots,
            {
                id: 101, 
                name: 'robot$flame-migration-project-target', 
                description: JSON.stringify(marker), 
            },
        ]);

        expect(await collectRegistryMigrationRetainedProjectIds(harbor.client)).toEqual(new Set(['11', '12']));
        expect(harbor.pages).toEqual([1, 2]);
    });

    it('fails closed rather than deleting projects when a later page is unavailable', async () => {
        const harbor = createClient(Array.from({ length: 100 }, (_, id) => ({ id, name: `ordinary-${id}` })), 2);

        await expect(collectRegistryMigrationRetainedProjectIds(harbor.client)).rejects.toThrow();
    });

    it.each(['not-json', JSON.stringify({ ...marker, sourceExternalId: null })])(
        'fails closed for a malformed migration retention record (%s)',
        async (description) => {
            const harbor = createClient([{
                id: 1, 
                name: 'robot$flame-migration-project-target', 
                description, 
            }]);

            await expect(collectRegistryMigrationRetainedProjectIds(harbor.client)).rejects.toThrow('no valid retention record');
        },
    );

    it('does not treat unrelated robot descriptions as retention records', async () => {
        const harbor = createClient([{
            id: 1, 
            name: 'ordinary', 
            description: 'a normal robot', 
        }]);

        expect(await collectRegistryMigrationRetainedProjectIds(harbor.client)).toEqual(new Set());
    });
});
