/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Analysis, Node } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import {
    LoggerMemoryTransport,
    LoggerModule,
    TAGGED_CACHE_MODULE_NAME,
    TaggedCacheInjectionKey,
    createTaggedCache,
} from '@privateaim/server-kit';
import type { ITaggedCache } from '@rapiq/cache';
import { buildCollectionTag } from '@rapiq/cache';
import { CacheInvalidationSubscriber } from '@rapiq/cache/typeorm';
import type { IModule } from 'orkos';
import type { EntityTarget, ObjectLiteral } from 'typeorm';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import {
    AnalysisEntity,
    NodeEntity,
    ProjectEntity,
    RegistryEntity,
    RegistryProjectEntity,
} from '../../../../../src/adapters/database/index.ts';
import { ConfigModule } from '../../../../../src/app/modules/config/index.ts';
import { DatabaseInjectionKey, DatabaseModule } from '../../../../../src/app/modules/database/index.ts';
import type { IAnalysisRepository, INodeRepository } from '../../../../../src/core/index.ts';
import {
    TestApplication,
    createTestDatabaseApplication,
    createTestDatabaseModule,
} from '../../../../app/index.ts';
import { createTestNode } from '../../../../utils/domains/node.ts';

type FailingTaggedCache = {
    cache: ITaggedCache,
    /** How many of the next invalidations reject without bumping. */
    fail: (count?: number) => void,
};

function createFailingTaggedCache(): FailingTaggedCache {
    const { cache } = createTaggedCache({ prefix: 'hub-core', onError: () => {} });
    let failures = 0;

    return {
        cache: {
            remember: (key, read, options) => cache.remember(key, read, options),
            invalidate: (tags) => {
                if (failures > 0) {
                    failures--;

                    return Promise.reject(new Error('The cache store is unreachable.'));
                }

                return cache.invalidate(tags);
            },
            drop: (keys) => cache.drop(keys),
        },
        fail: (count = 1) => {
            failures = count;
        },
    };
}

/** Stands in for the tagged cache module, so the database module wires this store. */
function createTaggedCacheModule(cache: ITaggedCache): IModule {
    return {
        name: TAGGED_CACHE_MODULE_NAME,
        async setup(container) {
            container.register(TaggedCacheInjectionKey, { useValue: cache });
        },
        async teardown(container) {
            container.unregister(TaggedCacheInjectionKey);
        },
    };
}

/** A read that counts its calls. */
function createRead() {
    const state = { calls: 0 };

    return {
        state,
        read: async () => {
            state.calls++;

            return 'value';
        },
    };
}

describe('app/modules/database/query-cache (client bindings)', () => {
    const suite = createTestDatabaseApplication();

    let nodes: INodeRepository;
    let analyses: IAnalysisRepository;

    beforeAll(async () => {
        await suite.setup();

        nodes = suite.container.resolve(DatabaseInjectionKey.NodeRepository);
        analyses = suite.container.resolve(DatabaseInjectionKey.AnalysisRepository);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    /** A delete no subscriber sees, like raw SQL: only a cache hit still answers the row. */
    async function deleteUnobserved(target: EntityTarget<ObjectLiteral>, id: string) {
        await suite.dataSource.createQueryBuilder()
            .delete()
            .from(target)
            .where('id = :id', { id })
            .callListeners(false)
            .execute();
    }

    async function createNode(input: Partial<Node> = {}) {
        const repository = suite.dataSource.getRepository(NodeEntity);

        return repository.save(repository.create({
            ...createTestNode(),
            realmId: faker.string.uuid(),
            clientId: faker.string.uuid(),
            ...input,
        }));
    }

    async function createAnalysis(input: Partial<Analysis> = {}) {
        const realmId = input.realmId ?? faker.string.uuid();
        const projects = suite.dataSource.getRepository(ProjectEntity);
        const project = await projects.save(projects.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId,
        }));

        const repository = suite.dataSource.getRepository(AnalysisEntity);

        return repository.save(repository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            projectId: project.id,
            clientId: faker.string.uuid(),
            ...input,
            realmId,
        }));
    }

    describe('node', () => {
        it('should answer a second lookup from the cache', async () => {
            const node = await createNode();

            expect((await nodes.findOneByClientBinding(node.clientId, node.realmId))?.id).toEqual(node.id);

            await deleteUnobserved(NodeEntity, node.id);

            expect((await nodes.findOneByClientBinding(node.clientId, node.realmId))?.id).toEqual(node.id);
        });

        it('should answer only the binding columns, as a plain object', async () => {
            const node = await createNode();

            for (let i = 0; i < 2; i++) {
                const binding = await nodes.findOneByClientBinding(node.clientId, node.realmId);

                expect(binding).not.toBeInstanceOf(NodeEntity);
                expect(binding).toEqual({
                    id: node.id,
                    clientId: node.clientId,
                    realmId: node.realmId,
                    registryProjectId: null,
                });
            }
        });

        it('should drop a cached miss when a node is created for the client', async () => {
            const clientId = faker.string.uuid();
            const realmId = faker.string.uuid();

            expect(await nodes.findOneByClientBinding(clientId, realmId)).toBeNull();

            const node = await createNode({ clientId, realmId });

            expect((await nodes.findOneByClientBinding(clientId, realmId))?.id).toEqual(node.id);
        });

        it('should drop the entry when the node gets another client', async () => {
            const node = await createNode();
            const { clientId } = node;

            expect(await nodes.findOneByClientBinding(clientId, node.realmId)).not.toBeNull();

            node.clientId = faker.string.uuid();
            await suite.dataSource.getRepository(NodeEntity).save(node);

            expect(await nodes.findOneByClientBinding(clientId, node.realmId)).toBeNull();
            expect((await nodes.findOneByClientBinding(node.clientId, node.realmId))?.id).toEqual(node.id);
        });

        it('should drop the entry when the node loses its client', async () => {
            const node = await createNode();
            const { clientId } = node;

            expect(await nodes.findOneByClientBinding(clientId, node.realmId)).not.toBeNull();

            node.clientId = null;
            await suite.dataSource.getRepository(NodeEntity).save(node);

            expect(await nodes.findOneByClientBinding(clientId, node.realmId)).toBeNull();
        });

        it('should drop the entry when the node moves to another realm', async () => {
            const node = await createNode();
            const { realmId } = node;

            expect(await nodes.findOneByClientBinding(node.clientId, realmId)).not.toBeNull();

            node.realmId = faker.string.uuid();
            await suite.dataSource.getRepository(NodeEntity).save(node);

            expect(await nodes.findOneByClientBinding(node.clientId, realmId)).toBeNull();
        });

        it('should drop the entry when the node is removed', async () => {
            const node = await createNode();
            const { clientId, realmId } = node;

            expect(await nodes.findOneByClientBinding(clientId, realmId)).not.toBeNull();

            await suite.dataSource.getRepository(NodeEntity).remove(node);

            expect(await nodes.findOneByClientBinding(clientId, realmId)).toBeNull();
        });

        it('should drop the entry when the database nulls its registry project', async () => {
            const registry = await suite.dataSource.getRepository(RegistryEntity).save({
                name: faker.string.alpha({ length: 16, casing: 'lower' }),
                host: 'https://harbor.test',
            });
            const registryProjects = suite.dataSource.getRepository(RegistryProjectEntity);
            const registryProject = await registryProjects.save(registryProjects.create({
                name: faker.string.alpha({ length: 16, casing: 'lower' }),
                externalName: faker.string.alpha({ length: 16, casing: 'lower' }),
                registryId: registry.id,
                realmId: faker.string.uuid(),
            }));
            const node = await createNode({ registryProjectId: registryProject.id });

            expect((await nodes.findOneByClientBinding(node.clientId, node.realmId))?.registryProjectId).toEqual(registryProject.id);

            // ON DELETE SET NULL: no hook sees the node row.
            await registryProjects.remove(registryProject);

            expect((await nodes.findOneByClientBinding(node.clientId, node.realmId))?.registryProjectId).toBeNull();

            await suite.dataSource.getRepository(RegistryEntity).remove(registry);
        });

        it('should drop the entry when a registry delete cascades into its registry project', async () => {
            const registries = suite.dataSource.getRepository(RegistryEntity);
            const registry = await registries.save({
                name: faker.string.alpha({ length: 16, casing: 'lower' }),
                host: 'https://harbor.test',
            });
            const registryProjects = suite.dataSource.getRepository(RegistryProjectEntity);
            const registryProject = await registryProjects.save(registryProjects.create({
                name: faker.string.alpha({ length: 16, casing: 'lower' }),
                externalName: faker.string.alpha({ length: 16, casing: 'lower' }),
                registryId: registry.id,
                realmId: faker.string.uuid(),
            }));
            const node = await createNode({ registryProjectId: registryProject.id });

            expect((await nodes.findOneByClientBinding(node.clientId, node.realmId))?.registryProjectId).toEqual(registryProject.id);

            // registry_projects CASCADE, then nodes SET NULL: a grandchild no hook sees.
            await registries.remove(registry);

            expect((await nodes.findOneByClientBinding(node.clientId, node.realmId))?.registryProjectId).toBeNull();
        });
    });

    describe('analysis', () => {
        it('should answer a second lookup from the cache', async () => {
            const analysis = await createAnalysis();

            expect((await analyses.findOneByClientBinding(analysis.clientId, analysis.realmId))?.id).toEqual(analysis.id);

            await deleteUnobserved(AnalysisEntity, analysis.id);

            expect((await analyses.findOneByClientBinding(analysis.clientId, analysis.realmId))?.id).toEqual(analysis.id);
        });

        it('should keep the entry through a write for another client', async () => {
            const analysis = await createAnalysis();

            expect(await analyses.findOneByClientBinding(analysis.clientId, analysis.realmId)).not.toBeNull();

            await deleteUnobserved(AnalysisEntity, analysis.id);

            const other = await createAnalysis({ realmId: analysis.realmId });

            other.buildStatus = ProcessStatus.STARTED;
            await suite.dataSource.getRepository(AnalysisEntity).save(other);

            // still answered: neither write carried this client or this row.
            expect((await analyses.findOneByClientBinding(analysis.clientId, analysis.realmId))?.id).toEqual(analysis.id);
        });

        it('should drop a cached miss when an analysis is created for the client', async () => {
            const clientId = faker.string.uuid();
            const realmId = faker.string.uuid();

            expect(await analyses.findOneByClientBinding(clientId, realmId)).toBeNull();

            const analysis = await createAnalysis({ clientId, realmId });

            expect((await analyses.findOneByClientBinding(clientId, realmId))?.id).toEqual(analysis.id);
        });

        it('should drop the entry when the analysis gets another client', async () => {
            const analysis = await createAnalysis();
            const { clientId } = analysis;

            expect(await analyses.findOneByClientBinding(clientId, analysis.realmId)).not.toBeNull();

            analysis.clientId = faker.string.uuid();
            await suite.dataSource.getRepository(AnalysisEntity).save(analysis);

            expect(await analyses.findOneByClientBinding(clientId, analysis.realmId)).toBeNull();
        });

        it('should drop the entry when the analysis loses its client', async () => {
            const analysis = await createAnalysis();
            const { clientId } = analysis;

            expect(await analyses.findOneByClientBinding(clientId, analysis.realmId)).not.toBeNull();

            analysis.clientId = null;
            await suite.dataSource.getRepository(AnalysisEntity).save(analysis);

            expect(await analyses.findOneByClientBinding(clientId, analysis.realmId)).toBeNull();
        });

        it('should drop a cached miss when the analysis of the client moves into the realm', async () => {
            const analysis = await createAnalysis();
            const realmId = faker.string.uuid();

            expect(await analyses.findOneByClientBinding(analysis.clientId, analysis.realmId)).not.toBeNull();
            expect(await analyses.findOneByClientBinding(analysis.clientId, realmId)).toBeNull();

            const previous = analysis.realmId;

            analysis.realmId = realmId;
            await suite.dataSource.getRepository(AnalysisEntity).save(analysis);

            expect((await analyses.findOneByClientBinding(analysis.clientId, realmId))?.id).toEqual(analysis.id);
            expect(await analyses.findOneByClientBinding(analysis.clientId, previous)).toBeNull();
        });

        it('should drop the entry when the analysis is removed', async () => {
            const analysis = await createAnalysis();
            const { clientId, realmId } = analysis;

            expect(await analyses.findOneByClientBinding(clientId, realmId)).not.toBeNull();

            await suite.dataSource.getRepository(AnalysisEntity).remove(analysis);

            expect(await analyses.findOneByClientBinding(clientId, realmId)).toBeNull();
        });

        it('should drop the entry when a locked update rebinds its row', async () => {
            const analysis = await createAnalysis();

            expect(await analyses.findOneByClientBinding(analysis.clientId, analysis.realmId)).not.toBeNull();

            await analyses.updateLocked(analysis.id, (entity) => {
                entity.buildStatus = ProcessStatus.STARTING;
                entity.clientId = faker.string.uuid();

                return true;
            });

            expect(await analyses.findOneByClientBinding(analysis.clientId, analysis.realmId)).toBeNull();
        });
    });

    describe('transactions', () => {
        it('should not store a read through a transactional manager', async () => {
            const cache = suite.container.resolve(DatabaseInjectionKey.QueryCache);
            const { state, read } = createRead();

            await suite.dataSource.transaction(async (manager) => {
                await cache.remember('t', () => [buildCollectionTag(DomainType.NODE)], read, { manager });
                await cache.remember('t', () => [buildCollectionTag(DomainType.NODE)], read, { manager });
            });
            expect(state.calls).toEqual(2);

            await cache.remember('t', () => [buildCollectionTag(DomainType.NODE)], read);
            await cache.remember('t', () => [buildCollectionTag(DomainType.NODE)], read);
            expect(state.calls).toEqual(3);
        });

        it('should store no uncommitted node a lookup sees inside a rolled-back transaction', async () => {
            const clientId = faker.string.uuid();
            const realmId = faker.string.uuid();

            await expect(suite.dataSource.transaction(async (manager) => {
                const repository = manager.getRepository(NodeEntity);

                await repository.save(repository.create({
                    ...createTestNode(),
                    clientId,
                    realmId,
                }));

                // better-sqlite3: the shared connection sees the uncommitted row.
                await nodes.findOneByClientBinding(clientId, realmId);

                throw new Error('rollback');
            })).rejects.toThrow('rollback');

            expect(await nodes.findOneByClientBinding(clientId, realmId)).toBeNull();
        });
    });
});

describe('app/modules/database/query-cache after a lost invalidation', () => {
    const transport = new LoggerMemoryTransport();
    const tagged = createFailingTaggedCache();

    // registered after the database module: the dependency still orders it first.
    const suite = new TestApplication({
        modules: [
            new ConfigModule(),
            new LoggerModule({ transports: [transport] }),
            createTestDatabaseModule(),
            createTaggedCacheModule(tagged.cache),
        ],
    });

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should wire the cache module registered after it', () => {
        expect(suite.dataSource.subscribers.some((subscriber) => subscriber instanceof CacheInvalidationSubscriber)).toBe(true);
    });

    it('should commit a write whose bump is lost and log it once', async () => {
        const repository = suite.dataSource.getRepository(NodeEntity);

        tagged.fail(2);

        const first = await repository.save(repository.create({ ...createTestNode(), realmId: faker.string.uuid() }));
        const second = await repository.save(repository.create({ ...createTestNode(), realmId: faker.string.uuid() }));

        expect(await repository.findOneBy({ id: first.id })).not.toBeNull();
        expect(await repository.findOneBy({ id: second.id })).not.toBeNull();
        expect(transport.items.filter((item) => String(item.message).startsWith('The cache invalidation failed: '))).toHaveLength(1);
    });

    it('should not answer the stale entry a lost bump left', async () => {
        const nodes = suite.container.resolve(DatabaseInjectionKey.NodeRepository);
        const repository = suite.dataSource.getRepository(NodeEntity);
        const node = await repository.save(repository.create({
            ...createTestNode(),
            clientId: faker.string.uuid(),
            realmId: faker.string.uuid(),
        }));
        const { clientId } = node;

        expect(await nodes.findOneByClientBinding(clientId, node.realmId)).not.toBeNull();

        tagged.fail();

        node.clientId = faker.string.uuid();
        await repository.save(node);

        expect(await nodes.findOneByClientBinding(clientId, node.realmId)).toBeNull();
    });
});

describe('app/modules/database/query-cache without a tagged cache', () => {
    const suite = new TestApplication({
        modules: [
            new ConfigModule(),
            new LoggerModule(),
            createTestDatabaseModule(),
        ],
    });

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should read every time and register no invalidation', async () => {
        const cache = suite.container.resolve(DatabaseInjectionKey.QueryCache);
        const { state, read } = createRead();

        await cache.remember('k', () => [buildCollectionTag(DomainType.NODE)], read);
        await cache.remember('k', () => [buildCollectionTag(DomainType.NODE)], read);
        expect(state.calls).toEqual(2);

        expect(suite.dataSource.subscribers.some((subscriber) => subscriber instanceof CacheInvalidationSubscriber)).toBe(false);
    });

    it('should let the production module order itself after the tagged cache', () => {
        expect(new DatabaseModule().dependencies).toContainEqual({ name: TAGGED_CACHE_MODULE_NAME, optional: true });
    });
});
