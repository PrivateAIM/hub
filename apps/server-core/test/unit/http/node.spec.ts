/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import type {
    Node,
} from '@privateaim/core-kit';
import { createTestApplication } from '../../app';
import {
    expectProperties,
    removeDateProperties,
} from '../../utils';
import { createTestNode } from '../../utils/domains';

describe('src/controllers/core/node', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    let details: Node;

    it('should create node', async () => {
        const { client } = suite;

        const { data: node } = await client.node.create(createTestNode());
        expect(node.id).toBeDefined();

        details = removeDateProperties(node);
    });

    it('should read collection', async () => {
        const { client } = suite;

        const { data } = await client.node.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const { client } = suite;

        const { data } = await client.node.getOne(details.id);
        expectProperties(details, data, { keysExcluded: ['robot_id'] });
    });

    it('should update resource', async () => {
        const { client } = suite;

        details.name = 'TestA';

        const { data } = await client.node.update(details.id, details);

        expectProperties(details, data);
    });

    it('should delete resource', async () => {
        const { client } = suite;

        await client.node.delete(details.id);
    });

    it('should survive registry deletion with detached references', async () => {
        const { client } = suite;

        const { data: registry } = await client.registry.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            host: faker.internet.domainName(),
        });

        const { data: node } = await client.node.create(createTestNode({ registry_id: registry.id }));
        expect(node.registry_id).toEqual(registry.id);
        // connecting provisions a registry project
        expect(node.registry_project_id).toBeDefined();

        await client.registry.delete(registry.id);

        // The registry FKs detach (SET NULL) instead of cascading: the node must
        // survive the registry deletion with its references nulled.
        const { data: found } = await client.node.getOne(node.id);
        expect(found.id).toEqual(node.id);
        expect(found.registry_id).toBeNull();
        expect(found.registry_project_id).toBeNull();
    });

    it('should tear down the registry project on disconnect', async () => {
        const { client } = suite;

        const { data: registry } = await client.registry.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            host: faker.internet.domainName(),
        });

        const { data: node } = await client.node.create(createTestNode({ registry_id: registry.id }));
        expect(node.registry_project_id).toBeDefined();

        // An explicit `registry_id: null` disconnects — the null must survive the
        // whole HTTP path (JSON body, validator) and detach the node.
        const { data: updated } = await client.node.update(node.id, { registry_id: null });
        expect(updated.registry_id).toBeNull();
        expect(updated.registry_project_id).toBeNull();

        // ... and the provisioned registry project is removed, not orphaned.
        const { data: projects } = await client.registryProject.getMany({ filters: { registry_id: registry.id } });
        expect(projects).toHaveLength(0);

        // Clean up: a registry left behind would make the default-registry
        // fallback auto-connect the bare nodes of suites that run later in
        // this worker's database.
        await client.registry.delete(registry.id);
    });
});
