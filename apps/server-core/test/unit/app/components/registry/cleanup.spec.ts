/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { HarborClient } from '@hapic/harbor';
import { REGISTRY_MASTER_IMAGE_PROJECT_NAME } from '@privateaim/core-kit';
import { MemoryTransport } from 'hapic';
import type { ComponentHandlerContext } from 'hubwire';
import type { DataSource } from 'typeorm';
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { RegistryEntity, RegistryProjectEntity } from '../../../../../src/adapters/database/entities/index.ts';
import { RegistryCleanupHandler } from '../../../../../src/app/components/registry/handlers/cleanup.ts';
import type { RegistryEventMap } from '../../../../../src/app/components/registry/types.ts';
import { RegistryCommand } from '../../../../../src/core/domains/index.ts';
import { createTestDatabaseApplication } from '../../../../app/index.ts';

describe('RegistryCleanupHandler', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;
    let registry: RegistryEntity;
    let otherRegistry: RegistryEntity;
    let project: RegistryProjectEntity;
    let requests: string[];
    let unlinks: unknown[];

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.dataSource;
    });

    beforeEach(async () => {
        const registries = dataSource.getRepository(RegistryEntity);

        registry = await registries.save({
            name: `cleanup-${randomUUID()}`,
            host: `https://${randomUUID()}.example`,
            accountName: 'admin',
            accountSecret: 'secret',
        }, { listeners: false });
        otherRegistry = await registries.save({
            name: `other-${randomUUID()}`,
            host: `https://${randomUUID()}.example`,
        }, { listeners: false });

        const projects = dataSource.getRepository(RegistryProjectEntity);

        project = await projects.save({
            registryId: registry.id,
            name: 'active',
            externalName: 'active',
            externalId: '13',
        }, { listeners: false });
        await projects.save({
            registryId: otherRegistry.id,
            name: 'foreign',
            externalName: 'same-name-in-other-registry',
            externalId: '15',
        }, { listeners: false });
        requests = [];
        unlinks = [];
    });

    afterEach(async () => {
        await dataSource.getRepository(RegistryEntity).createQueryBuilder()
            .delete()
            .whereInIds([registry.id, otherRegistry.id])
            .callListeners(false)
            .execute();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    function createHandler(options: { malformedMarker?: boolean, failEndpoint?: string } = {}) {
        const marker = {
            kind: 'privateaim-registry-project-migration',
            version: 1,
            registryId: registry.id,
            registryProjectId: project.id,
            sourceExternalName: 'old-source-name',
            sourceExternalId: '11',
            targetExternalName: 'old-target-name',
            targetExternalId: '12',
        };
        const transport = new MemoryTransport({
            fetch(request) {
                const url = new URL(request.url);

                requests.push(url.pathname);
                expect(request.method).toBe('GET');

                if (url.pathname === options.failEndpoint) {
                    return { status: 503, body: { message: 'unavailable' } };
                }

                if (url.pathname === '/api/v2.0/robots') {
                    return {
                        status: 200,
                        body: [{
                            id: 100,
                            name: 'robot$flame-migration-retained',
                            description: options.malformedMarker ? '{broken' : JSON.stringify(marker),
                        }],
                    };
                }

                if (url.pathname === '/api/v2.0/projects') {
                    return {
                        status: 200,
                        body: [
                            { project_id: 11, name: 'retained-source-renamed' },
                            { project_id: 12, name: 'pending-target-renamed' },
                            { project_id: 13, name: 'active' },
                            { project_id: 14, name: 'orphan' },
                            { project_id: 15, name: 'same-name-in-other-registry' },
                            { project_id: 16, name: REGISTRY_MASTER_IMAGE_PROJECT_NAME },
                        ],
                    };
                }

                throw new Error(`Unexpected Harbor request: ${request.method} ${request.url}`);
            },
        });
        const client = new HarborClient({ request: { baseURL: 'http://harbor/api/v2.0/', transport } });

        return new RegistryCleanupHandler(async () => dataSource, () => client);
    }

    async function cleanup(handler: RegistryCleanupHandler) {
        const context: ComponentHandlerContext<RegistryEventMap, RegistryCommand.CLEANUP> = {
            key: RegistryCommand.CLEANUP,
            metadata: {},
            async handle(key, data) {
                expect(key).toBe(RegistryCommand.PROJECT_UNLINK);
                unlinks.push(data);
            },
        };

        await handler.handle({ id: registry.id }, context);
    }

    it('retains migration source and pending target by Harbor ID and active local projects, unlinking only true orphans in this registry', async () => {
        await cleanup(createHandler());

        expect(requests).toEqual(['/api/v2.0/robots', '/api/v2.0/projects']);
        expect(unlinks).toEqual([
            { registryId: registry.id, externalName: 'orphan' },
            { registryId: registry.id, externalName: 'same-name-in-other-registry' },
        ]);
    });

    it('refuses all unlinks when a migration retention marker is malformed', async () => {
        await expect(cleanup(createHandler({ malformedMarker: true }))).rejects.toThrow('no valid retention record');

        expect(requests).toEqual(['/api/v2.0/robots']);
        expect(unlinks).toEqual([]);
    });

    it.each(['/api/v2.0/robots', '/api/v2.0/projects'])('refuses all unlinks when Harbor %s fails', async (failEndpoint) => {
        await expect(cleanup(createHandler({ failEndpoint }))).rejects.toThrow();

        expect(requests).toContain(failEndpoint);
        expect(unlinks).toEqual([]);
    });
});
