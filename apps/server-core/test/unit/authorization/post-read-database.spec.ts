/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
import type { FakeActorContext } from '@privateaim/server-test-kit';
import { createScopedActor } from '@privateaim/server-test-kit';
import type { DataSource } from 'typeorm';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    NodeEntity,
    ProjectEntity,
    RegistryEntity,
    RegistryProjectEntity,
} from '../../../src/adapters/database/index.ts';
import { AnalysisInjectionKey } from '../../../src/app/modules/analysis/constants.ts';
import { DatabaseInjectionKey } from '../../../src/app/modules/database/index.ts';
import {
    AnalysisBucketFileService,
    AnalysisBucketService,
    AnalysisNodeEventService,
    AnalysisNodeService,
    AnalysisService,
    RegistryProjectService,
} from '../../../src/core/index.ts';
import { AnalysisBucketAccess } from '../../../src/core/services/analysis-bucket-access/index.ts';
import { AnalysisLogAccessService, LogAccessIntent } from '../../../src/core/services/analysis-log-access/index.ts';
import { AnalysisReachService } from '../../../src/core/services/analysis-reach/index.ts';
import { createTestDatabaseApplication } from '../../app';

// A grant that does not lower (`post`) is decided per row. The decision runs
// extra queries built on a bare `Query` (the stored rows by id, the page's
// analyses, the refined reach with its relation paths); this runs them through
// the typeorm repositories against the suite's database.

const OWN_REALM = randomUUID();
const FOREIGN_REALM = randomUUID();
const THIRD_REALM = randomUUID();

/** A policy no column condition expresses: rows (analyses) named `open…`. */
const policy = (row: Record<string, any>) => typeof row.name === 'string' && row.name.startsWith('open');

function createActor(realmScope: 'any' | 'own' = 'any'): FakeActorContext {
    return createScopedActor({
        realmId: OWN_REALM,
        realmScope,
        policy,
    });
}

function uniqueName(prefix: string): string {
    return `${prefix}-${randomUUID().slice(0, 8)}`;
}

type SeededAnalysis = {
    analysis: AnalysisEntity,
    buckets: Record<AnalysisBucketType, AnalysisBucketEntity>,
    files: Record<AnalysisBucketType, AnalysisBucketFileEntity>,
};

describe('a post verdict through the database repositories', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;

    let registryProjectService: RegistryProjectService;
    let analysisService: AnalysisService;
    let analysisBucketService: AnalysisBucketService;
    let analysisBucketFileService: AnalysisBucketFileService;
    let analysisNodeService: AnalysisNodeService;
    let analysisNodeEventService: AnalysisNodeEventService;
    let analysisBucketAccess: AnalysisBucketAccess;
    let analysisLogAccess: AnalysisLogAccessService;

    let registryId: string;
    let registryProjects: Record<'ownOpen' | 'ownClosed' | 'foreignOpen' | 'globalOpen', RegistryProjectEntity>;

    let projectId: string;
    let ownOpen: SeededAnalysis;
    let ownClosed: SeededAnalysis;
    let foreignOpen: SeededAnalysis;
    /** Closed and foreign; a node of the actor's realm takes part, not approved. */
    let joinedPending: SeededAnalysis;
    /** Closed and foreign; a node of the actor's realm takes part, approved. */
    let joinedApproved: SeededAnalysis;
    let all: SeededAnalysis[];

    let ownNodeId: string;
    let thirdNodeId: string;

    async function seedRegistryProject(prefix: string, realmId: string | null) {
        const repository = dataSource.getRepository(RegistryProjectEntity);

        return repository.save(repository.create({
            name: uniqueName(prefix),
            externalName: uniqueName('ext'),
            registryId,
            realmId,
        }));
    }

    async function seedAnalysis(prefix: string, realmId: string): Promise<SeededAnalysis> {
        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.save(analysisRepository.create({
            name: uniqueName(prefix),
            realmId,
            projectId,
        }));

        const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        const fileRepository = dataSource.getRepository(AnalysisBucketFileEntity);

        const buckets: Partial<SeededAnalysis['buckets']> = {};
        const files: Partial<SeededAnalysis['files']> = {};

        for (const type of Object.values(AnalysisBucketType)) {
            const bucket = await bucketRepository.save(bucketRepository.create({
                type,
                bucketId: randomUUID(),
                analysisId: analysis.id,
                realmId,
            }));

            buckets[type] = bucket;
            files[type] = await fileRepository.save(fileRepository.create({
                path: `${type}.bin`,
                bucketId: bucket.bucketId,
                bucketFileId: randomUUID(),
                analysisId: analysis.id,
                analysisBucketId: bucket.id,
                // The uploader's realm, deliberately the actor's own on every
                // file: it must not decide anything.
                realmId: OWN_REALM,
            }));
        }

        return {
            analysis,
            buckets: buckets as SeededAnalysis['buckets'],
            files: files as SeededAnalysis['files'],
        };
    }

    async function seedNode(realmId: string) {
        const repository = dataSource.getRepository(NodeEntity);
        const node = await repository.save(repository.create({ name: uniqueName('node'), realmId }));

        return node.id;
    }

    async function seedAnalysisNode(target: SeededAnalysis, nodeId: string, nodeRealmId: string, approvalStatus: AnalysisNodeApprovalStatus | null) {
        const repository = dataSource.getRepository(AnalysisNodeEntity);

        return repository.save(repository.create({
            analysisId: target.analysis.id,
            analysisRealmId: target.analysis.realmId,
            nodeId,
            nodeRealmId,
            approvalStatus,
        }));
    }

    async function seedAnalysisNodeEvent(target: SeededAnalysis, nodeId: string, nodeRealmId: string) {
        const repository = dataSource.getRepository(AnalysisNodeEventEntity);

        return repository.save(repository.create({
            analysisId: target.analysis.id,
            analysisRealmId: target.analysis.realmId,
            nodeId,
            nodeRealmId,
        }));
    }

    const analysisIds = () => all.map((entry) => entry.analysis.id).join(',');

    beforeAll(async () => {
        await suite.setup();

        const { container } = suite;

        dataSource = suite.dataSource;

        const analysisRepository = container.resolve(DatabaseInjectionKey.AnalysisRepository);
        const analysisNodeRepository = container.resolve(DatabaseInjectionKey.AnalysisNodeRepository);
        const analysisBucketRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketRepository);
        const nodeRepository = container.resolve(DatabaseInjectionKey.NodeRepository);
        const projectNodeRepository = container.resolve(DatabaseInjectionKey.ProjectNodeRepository);

        const reach = new AnalysisReachService({
            analysisNodeRepository,
            analysisRepository,
            nodeRepository,
        });

        registryProjectService = new RegistryProjectService({
            repository: container.resolve(DatabaseInjectionKey.RegistryProjectRepository),
            nodeRepository,
        });
        analysisService = new AnalysisService({
            repository: analysisRepository,
            projectRepository: container.resolve(DatabaseInjectionKey.ProjectRepository),
            projectNodeRepository,
            analysisNodeRepository,
            builder: container.resolve(AnalysisInjectionKey.Builder),
            configurator: container.resolve(AnalysisInjectionKey.Configurator),
            distributor: container.resolve(AnalysisInjectionKey.Distributor),
            storageManager: container.resolve(AnalysisInjectionKey.StorageManager),
            recalculator: container.resolve(AnalysisInjectionKey.AnalysisRecalculator),
            nodeRecalculator: container.resolve(AnalysisInjectionKey.NodeRecalculator),
            reach,
        });
        analysisBucketService = new AnalysisBucketService({
            repository: analysisBucketRepository,
            analysisRepository,
            reach,
        });
        analysisBucketAccess = new AnalysisBucketAccess({
            reach,
            analysisRepository,
            analysisNodeRepository,
        });
        analysisBucketFileService = new AnalysisBucketFileService({
            repository: container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository),
            recalculator: container.resolve(AnalysisInjectionKey.FileRecalculator),
            reach,
            analysisBucketAccess,
            analysisRepository,
            analysisBucketRepository,
        });
        analysisNodeService = new AnalysisNodeService({
            repository: analysisNodeRepository,
            analysisRepository,
            projectNodeRepository,
            recalculator: container.resolve(AnalysisInjectionKey.NodeRecalculator),
            reach,
        });
        analysisNodeEventService = new AnalysisNodeEventService({
            repository: container.resolve(DatabaseInjectionKey.AnalysisNodeEventRepository),
            reach,
        });
        analysisLogAccess = new AnalysisLogAccessService({
            analysisRepository,
            analysisNodeRepository,
            nodeRepository,
            reach,
        });

        const registryRepository = dataSource.getRepository(RegistryEntity);
        const registry = await registryRepository.save(registryRepository.create({
            name: uniqueName('registry'),
            host: `${uniqueName('host')}.example.com`,
        }));

        registryId = registry.id;
        registryProjects = {
            ownOpen: await seedRegistryProject('open', OWN_REALM),
            ownClosed: await seedRegistryProject('closed', OWN_REALM),
            foreignOpen: await seedRegistryProject('open', FOREIGN_REALM),
            globalOpen: await seedRegistryProject('open', null),
        };

        const projectRepository = dataSource.getRepository(ProjectEntity);
        const project = await projectRepository.save(projectRepository.create({
            name: uniqueName('project'),
            realmId: OWN_REALM,
        }));

        projectId = project.id;

        ownOpen = await seedAnalysis('open', OWN_REALM);
        ownClosed = await seedAnalysis('closed', OWN_REALM);
        foreignOpen = await seedAnalysis('open', FOREIGN_REALM);
        joinedPending = await seedAnalysis('closed', FOREIGN_REALM);
        joinedApproved = await seedAnalysis('closed', FOREIGN_REALM);
        all = [ownOpen, ownClosed, foreignOpen, joinedPending, joinedApproved];

        ownNodeId = await seedNode(OWN_REALM);
        thirdNodeId = await seedNode(THIRD_REALM);

        await seedAnalysisNode(joinedPending, ownNodeId, OWN_REALM, null);
        await seedAnalysisNode(joinedApproved, ownNodeId, OWN_REALM, AnalysisNodeApprovalStatus.APPROVED);
        // Rows of another realm's node: reached through the analysis, or not at all.
        await seedAnalysisNode(foreignOpen, thirdNodeId, THIRD_REALM, AnalysisNodeApprovalStatus.APPROVED);
        await seedAnalysisNode(ownClosed, thirdNodeId, THIRD_REALM, AnalysisNodeApprovalStatus.APPROVED);
        await seedAnalysisNode(joinedPending, thirdNodeId, THIRD_REALM, AnalysisNodeApprovalStatus.APPROVED);

        for (const target of all) {
            await seedAnalysisNodeEvent(target, thirdNodeId, THIRD_REALM);
        }
    }, 120_000);

    afterAll(async () => {
        await suite.teardown();
    });

    describe('registry projects (findManyScoped)', () => {
        const idsOf = (keys: (keyof typeof registryProjects)[]) => keys.map((key) => registryProjects[key].id).sort();

        it('compiles to post', async () => {
            await expect(createActor().permissionEvaluator.compile({ name: 'registry_project_read' }))
                .resolves.toEqual({ verdict: 'post' });
        });

        it('lists exactly the rows the evaluation allows, in every realm', async () => {
            const result = await registryProjectService.getMany({ filter: { registryId } }, createActor());

            // Not ownClosed, although it is in the actor's realm.
            expect(result.data.map((row) => row.id).sort()).toEqual(idsOf(['ownOpen', 'foreignOpen', 'globalOpen']));
            expect(result.meta.total).toEqual(3);
        });

        it('applies the realm scope of the grant per row', async () => {
            const result = await registryProjectService.getMany({ filter: { registryId } }, createActor('own'));

            expect(result.data.map((row) => row.id)).toEqual(idsOf(['ownOpen']));
        });

        it('decides a sparse fieldset on the stored rows and returns the projection', async () => {
            const result = await registryProjectService.getMany({ filter: { registryId }, fields: 'id' }, createActor());

            expect(result.data.map((row) => row.id).sort()).toEqual(idsOf(['ownOpen', 'foreignOpen', 'globalOpen']));

            for (const row of result.data) {
                expect(row.realmId).toBeUndefined();
                expect(row.name).toBeUndefined();
            }
        });

        it('decides a record read like the list', async () => {
            const actor = createActor();

            await expect(registryProjectService.getOne(registryProjects.foreignOpen.id, actor))
                .resolves.toMatchObject({ id: registryProjects.foreignOpen.id });
            await expect(registryProjectService.getOne(registryProjects.globalOpen.id, actor, { fields: 'id' }))
                .resolves.toMatchObject({ id: registryProjects.globalOpen.id });
            await expect(registryProjectService.getOne(registryProjects.ownClosed.id, actor))
                .rejects.toThrow(EntityNotFoundError);
            await expect(registryProjectService.getOne(registryProjects.ownClosed.id, actor, { fields: 'id' }))
                .rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('analyses', () => {
        const idsOf = (entries: SeededAnalysis[]) => entries.map((entry) => entry.analysis.id).sort();

        it('lists what the evaluation allows plus what a node of the realm takes part in', async () => {
            const result = await analysisService.getMany({ filter: { projectId } }, createActor());

            expect(result.data.map((row) => row.id).sort())
                .toEqual(idsOf([ownOpen, foreignOpen, joinedPending, joinedApproved]));
            expect(result.meta.total).toEqual(4);
        });

        it('applies the realm scope of the grant per analysis', async () => {
            const result = await analysisService.getMany({ filter: { projectId } }, createActor('own'));

            expect(result.data.map((row) => row.id).sort()).toEqual(idsOf([ownOpen, joinedPending, joinedApproved]));
        });

        it('decides a sparse fieldset on the stored analyses', async () => {
            const result = await analysisService.getMany({ filter: { projectId }, fields: 'id' }, createActor());

            expect(result.data.map((row) => row.id).sort())
                .toEqual(idsOf([ownOpen, foreignOpen, joinedPending, joinedApproved]));
            expect(result.data.every((row) => row.realmId === undefined)).toBe(true);
        });

        it('decides a record read like the list', async () => {
            const actor = createActor();

            await expect(analysisService.getOne(foreignOpen.analysis.id, actor))
                .resolves.toMatchObject({ id: foreignOpen.analysis.id });
            await expect(analysisService.getOne(joinedPending.analysis.id, actor, { fields: 'id' }))
                .resolves.toMatchObject({ id: joinedPending.analysis.id });
            await expect(analysisService.getOne(ownClosed.analysis.id, actor)).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('analysis bucket files (per bucket type)', () => {
        const fileIds = (entries: [SeededAnalysis, AnalysisBucketType[]][]) => entries
            .flatMap(([entry, types]) => types.map((type) => entry.files[type].id))
            .sort();

        const EVERY_TYPE = Object.values(AnalysisBucketType);

        const expected = () => fileIds([
            [ownOpen, EVERY_TYPE],
            [foreignOpen, EVERY_TYPE],
            // by participation: CODE for a pending node, everything once approved
            [joinedPending, [AnalysisBucketType.CODE]],
            [joinedApproved, EVERY_TYPE],
        ]);

        it('lists the files of the reached analyses, per bucket type', async () => {
            const result = await analysisBucketFileService.getMany({ filter: { analysisId: analysisIds() } }, createActor());

            expect(result.data.map((row) => row.id).sort()).toEqual(expected());
            // 15 files seeded, 5 dropped.
            expect(result.meta.total).toEqual(10);
        });

        it('lists the same files for a sparse fieldset and with the relations included', async () => {
            const sparse = await analysisBucketFileService.getMany(
                { filter: { analysisId: analysisIds() }, fields: 'id' },
                createActor(),
            );

            expect(sparse.data.map((row) => row.id).sort()).toEqual(expected());
            expect(sparse.data.every((row) => row.analysisId === undefined)).toBe(true);

            const included = await analysisBucketFileService.getMany(
                { filter: { analysisId: analysisIds() }, include: 'analysis,analysisBucket' },
                createActor(),
            );

            expect(included.data.map((row) => row.id).sort()).toEqual(expected());
        });

        it('decides a record read like the list', async () => {
            const actor = createActor();

            await expect(analysisBucketFileService.getOne(foreignOpen.files[AnalysisBucketType.RESULT].id, actor))
                .resolves.toMatchObject({ id: foreignOpen.files[AnalysisBucketType.RESULT].id });
            await expect(analysisBucketFileService.getOne(joinedPending.files[AnalysisBucketType.CODE].id, actor))
                .resolves.toMatchObject({ id: joinedPending.files[AnalysisBucketType.CODE].id });
            await expect(analysisBucketFileService.getOne(joinedPending.files[AnalysisBucketType.TEMP].id, actor))
                .rejects.toThrow(EntityNotFoundError);
            await expect(analysisBucketFileService.getOne(ownClosed.files[AnalysisBucketType.CODE].id, actor))
                .rejects.toThrow(EntityNotFoundError);
        });

        it('decides a full page without truncating the re-read', async () => {
            const bulk = await seedAnalysis('open', FOREIGN_REALM);
            const repository = dataSource.getRepository(AnalysisBucketFileEntity);
            const bucket = bulk.buckets[AnalysisBucketType.CODE];

            await repository.save(Array.from({ length: 60 }, (_, index) => repository.create({
                path: `bulk-${index}.bin`,
                bucketId: bucket.bucketId,
                bucketFileId: randomUUID(),
                analysisId: bulk.analysis.id,
                analysisBucketId: bucket.id,
                realmId: OWN_REALM,
            })));

            const result = await analysisBucketFileService.getMany(
                { filter: { analysisId: bulk.analysis.id }, page: { limit: 50 } },
                createActor(),
            );

            // 63 reached files: a full page of 50, none lost to the decision.
            expect(result.data).toHaveLength(50);
            expect(result.meta.total).toEqual(63);
        });
    });

    describe('analysis buckets', () => {
        it('lists the buckets of the reached analyses, per bucket type', async () => {
            const result = await analysisBucketService.getMany({ filter: { analysisId: analysisIds() } }, createActor());

            const expected = [
                ...Object.values(ownOpen.buckets),
                ...Object.values(foreignOpen.buckets),
                joinedPending.buckets[AnalysisBucketType.CODE],
                ...Object.values(joinedApproved.buckets),
            ].map((bucket) => bucket.id).sort();

            expect(result.data.map((row) => row.id).sort()).toEqual(expected);
        });

        it('answers canRead like the listing', async () => {
            const actor = createActor();

            await expect(analysisBucketAccess.canRead(actor, foreignOpen.buckets[AnalysisBucketType.RESULT])).resolves.toBe(true);
            await expect(analysisBucketAccess.canRead(actor, ownClosed.buckets[AnalysisBucketType.CODE])).resolves.toBe(false);
            await expect(analysisBucketAccess.canRead(actor, joinedPending.buckets[AnalysisBucketType.CODE])).resolves.toBe(true);
            await expect(analysisBucketAccess.canRead(actor, joinedPending.buckets[AnalysisBucketType.TEMP])).resolves.toBe(false);
            await expect(analysisBucketAccess.canRead(actor, joinedApproved.buckets[AnalysisBucketType.RESULT])).resolves.toBe(true);
        });
    });

    describe('analysis nodes and their events', () => {
        it('lists every row of a reached analysis, none of an unreached one', async () => {
            const result = await analysisNodeService.getMany({ filter: { analysisId: analysisIds() } }, createActor());

            const reached = new Set([foreignOpen, joinedPending, joinedApproved].map((entry) => entry.analysis.id));

            // foreignOpen 1, joinedPending 2 (the peer's row included), joinedApproved 1; not ownClosed's.
            expect(result.data).toHaveLength(4);
            expect(result.data.every((row) => reached.has(row.analysisId))).toBe(true);
            expect(result.meta.total).toEqual(4);
        });

        it('lists the events of the reached analyses', async () => {
            const result = await analysisNodeEventService.getMany({ filter: { analysisId: analysisIds() } }, createActor());

            expect(result.data.map((row) => row.analysisId).sort())
                .toEqual([ownOpen, foreignOpen, joinedPending, joinedApproved].map((entry) => entry.analysis.id).sort());
        });
    });

    describe('analysis log access', () => {
        it('reads the logs of an analysis the grant or an approved node reaches', async () => {
            const actor = createActor();

            await expect(analysisLogAccess.assertAnalysisLogAccess(foreignOpen.analysis.id, actor, LogAccessIntent.READ))
                .resolves.toBeUndefined();
            await expect(analysisLogAccess.assertAnalysisLogAccess(joinedApproved.analysis.id, actor, LogAccessIntent.READ))
                .resolves.toBeUndefined();
            await expect(analysisLogAccess.assertAnalysisLogAccess(joinedPending.analysis.id, actor, LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
            await expect(analysisLogAccess.assertAnalysisLogAccess(ownClosed.analysis.id, actor, LogAccessIntent.READ))
                .rejects.toThrow(EntityNotFoundError);
        });

        it('deletes through the grant alone', async () => {
            const actor = createActor();

            await expect(analysisLogAccess.assertAnalysisLogAccess(foreignOpen.analysis.id, actor, LogAccessIntent.DELETE))
                .resolves.toBeUndefined();
            await expect(analysisLogAccess.assertAnalysisLogAccess(joinedApproved.analysis.id, actor, LogAccessIntent.DELETE))
                .rejects.toThrow(EntityNotFoundError);
        });
    });
});
