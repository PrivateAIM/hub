/*
 * Copyright (c) 2021-2024.
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
import type { Project } from '@privateaim/core-kit';
import {
    
    expectProperties,
    removeDateProperties,
} from '../../utils';
import { contains, or } from '@rapiq/core';
import { createNanoID } from '@privateaim/kit';
import { createTestProject } from '../../utils/domains';

describe('src/controllers/core/project', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    let details : Project;

    /**
     * The project list search matches a partial name against BOTH `name` and
     * `displayName`, which needs rapiq's `contains` inside an `or`. `or` is
     * round-tripped elsewhere; `contains` was covered by nothing, and the
     * whole search feature depends on it reaching the database as a LIKE.
     */
    it('should filter by a partial name or displayName', async () => {
        const { client } = suite;

        const token = createNanoID();
        const { data: byName } = await client.project.create(
            createTestProject({ name: `alpha-${token}-zeta` }),
        );
        const { data: byDisplayName } = await client.project.create(
            createTestProject({ displayName: `Beta ${token} Omega` }),
        );
        const { data: unrelated } = await client.project.create(createTestProject());

        const { data } = await client.project.getMany({ filters: or(contains('name', token), contains('displayName', token)) });

        const ids = data.map((item) => item.id);
        expect(ids).toContain(byName.id);
        expect(ids).toContain(byDisplayName.id);
        expect(ids).not.toContain(unrelated.id);
    });

    /**
     * `FiltersOptions.caseSensitive` documents a case-INSENSITIVE default for
     * equality comparisons only, and says nothing about `contains`. The search
     * box would be unusable if a partial match were case-sensitive, so pin the
     * behaviour rather than assume it.
     */
    it('should match a partial name irrespective of case', async () => {
        const { client } = suite;

        const token = createNanoID().toLowerCase();
        const { data: project } = await client.project.create(
            createTestProject({ name: `gamma-${token}-delta` }),
        );

        const { data } = await client.project.getMany({
            filters: or(
                contains('name', token.toUpperCase()),
                contains('displayName', token.toUpperCase()),
            ),
        });

        expect(data.map((item) => item.id)).toContain(project.id);
    });


    it('should create resource', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        details = removeDateProperties(project);
    });

    it('should read collection', async () => {
        const { client } = suite;

        const { data } = await client.project.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const { client } = suite;

        const { data } = await client.project.getOne(details.id);
        expectProperties(details, data);
    });

    it('should update resource', async () => {
        const { client } = suite;

        details.name = 'test-a';

        const { data } = await client.project.update(details.id, details);
        expectProperties(details, data);
    });

    it('should delete resource', async () => {
        const { client } = suite;

        await client.project.delete(details.id);
    });
});
