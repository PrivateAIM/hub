/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType, PermissionError } from '@authup/access';
import type { Node, Project, ProjectNode } from '@privateaim/core-kit';
import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { ProjectNodeService } from '../../../../../src/core/entities/project-node/service.ts';
import { createPermissionActor } from '../../helpers/index.ts';
import {
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeProjectRepository } from '../project/fake-repository.ts';
import { FakeProjectNodeRepository } from './fake-repository.ts';

const CREATOR_ID = randomUUID();

function createFakeProjectNodeRepository(projectRealmId: string, nodeRealmId: string) {
    const repo = new FakeProjectNodeRepository();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);

    repo.validateJoinColumns = async (data: Partial<ProjectNode>) => {
        await originalValidateJoinColumns(data);

        if (!data.project) {
            data.project = {
                id: data.projectId,
                realmId: projectRealmId,
                nodes: 0,
                userId: CREATOR_ID,
            } as Project;
        }

        if (!data.node) {
            data.node = {
                id: data.nodeId,
                name: 'test-node',
                type: NodeType.DEFAULT,
                realmId: nodeRealmId,
            } as Node;
        }
    };

    return repo;
}

function createTestProjectNode(overrides?: Partial<ProjectNode>): ProjectNode {
    return {
        id: randomUUID(),
        approvalStatus: null,
        comment: null,
        projectId: randomUUID(),
        projectRealmId: 'realm-1',
        nodeId: randomUUID(),
        nodeRealmId: 'realm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as ProjectNode;
}

describe('ProjectNodeService', () => {
    let repository: FakeProjectNodeRepository;
    let projectRepository: FakeProjectRepository;
    let service: ProjectNodeService;
    let projectId: string;
    let nodeId: string;

    beforeEach(() => {
        projectId = randomUUID();
        nodeId = randomUUID();

        repository = createFakeProjectNodeRepository('realm-1', 'realm-1');
        projectRepository = new FakeProjectRepository();

        projectRepository.seed({
            id: projectId,
            name: 'test-project',
            nodes: 0,
            analyses: 0,
            realmId: 'realm-1',
        } as Project);

        service = new ProjectNodeService({
            repository,
            projectRepository,
            skipProjectApproval: false,
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestProjectNode({ id: 'pn-1' }),
                createTestProjectNode({ id: 'pn-2' }),
            ]);

            const result = await service.getMany({});

            expect(result.data).toHaveLength(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const pn = createTestProjectNode({ id: 'pn-1' });

            repository.seed(pn);

            const result = await service.getOne('pn-1');

            expect(result.id).toBe('pn-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const result = await service.create(
                { projectId, nodeId },
                createAllowAllActor('realm-1'),
            );

            expect(result.projectId).toBe(projectId);
            expect(result.nodeId).toBe(nodeId);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should set realm IDs from joined entities', async () => {
            const result = await service.create(
                { projectId, nodeId },
                createAllowAllActor('realm-1'),
            );

            expect(result.projectRealmId).toBe('realm-1');
            expect(result.nodeRealmId).toBe('realm-1');
        });

        it('should deny when actor lacks permission', async () => {
            await expect(
                service.create(
                    { projectId, nodeId },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(PermissionError);
        });

        it('should require PROJECT_UPDATE to attach nodes, even for the project creator', async () => {
            const realm = { id: 'realm-1', name: 'realm-1' };

            await expect(
                service.create(
                    { projectId, nodeId },
                    createPermissionActor({
                        realm,
                        identity: { id: CREATOR_ID, type: 'user' },
                        permissions: [PermissionName.PROJECT_CREATE],
                    }),
                ),
            ).rejects.toThrow(PermissionError);

            const result = await service.create(
                { projectId, nodeId },
                createPermissionActor({ realm, permissions: [PermissionName.PROJECT_UPDATE] }),
            );

            expect(result.id).toBeDefined();
        });

        it('should deny attaching when the grant does not reach the project realm', async () => {
            const foreignService = new ProjectNodeService({
                repository: createFakeProjectNodeRepository('other-realm', 'realm-1'),
                projectRepository,
                skipProjectApproval: false,
            });

            await expect(
                foreignService.create(
                    { projectId, nodeId },
                    createScopedActor({ realmId: 'realm-1', realmScope: 'own' }),
                ),
            ).rejects.toThrow(PermissionError);
        });

        it('should attach a node of another realm when the grant reaches the project realm', async () => {
            const foreignService = new ProjectNodeService({
                repository: createFakeProjectNodeRepository('realm-1', 'other-realm'),
                projectRepository,
                skipProjectApproval: false,
            });

            const result = await foreignService.create(
                { projectId, nodeId },
                createScopedActor({ realmId: 'realm-1', realmScope: 'own' }),
            );

            expect(result.nodeRealmId).toBe('other-realm');
        });

        it('should auto-approve when skipProjectApproval is true', async () => {
            const approvalService = new ProjectNodeService({
                repository,
                projectRepository,
                skipProjectApproval: true,
            });

            const result = await approvalService.create(
                { projectId, nodeId },
                createAllowAllActor('realm-1'),
            );

            expect(result.approvalStatus).toBe(ProjectNodeApprovalStatus.APPROVED);
        });

        it('should auto-approve for aggregator nodes', async () => {
            const aggregatorRepo = createFakeProjectNodeRepository('realm-1', 'realm-1');
            const origValidate = aggregatorRepo.validateJoinColumns.bind(aggregatorRepo);

            aggregatorRepo.validateJoinColumns = async (data: Partial<ProjectNode>) => {
                await origValidate(data);

                if (data.node) {
                    data.node.type = NodeType.AGGREGATOR;
                }
            };

            const aggregatorService = new ProjectNodeService({
                repository: aggregatorRepo,
                projectRepository,
                skipProjectApproval: false,
            });

            const result = await aggregatorService.create(
                { projectId, nodeId },
                createAllowAllActor('realm-1'),
            );

            expect(result.approvalStatus).toBe(ProjectNodeApprovalStatus.APPROVED);
        });

        it('should increment project nodes count', async () => {
            await service.create(
                { projectId, nodeId },
                createAllowAllActor('realm-1'),
            );

            const project = await projectRepository.findOneBy({ id: projectId });

            expect(project!.nodes).toBe(1);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const pn = createTestProjectNode({ nodeRealmId: 'realm-1' });

            repository.seed(pn);

            const result = await service.update(
                pn.id,
                { approvalStatus: ProjectNodeApprovalStatus.APPROVED },
                createAllowAllActor(),
            );

            expect(result.approvalStatus).toBe(ProjectNodeApprovalStatus.APPROVED);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', {}, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny when actor lacks permission', async () => {
            const pn = createTestProjectNode();

            repository.seed(pn);

            await expect(
                service.update(pn.id, {}, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        // Approval is the node's decision: reaching the project realm is not enough.
        it('should deny approving when the grant does not reach the node realm', async () => {
            const pn = createTestProjectNode({ nodeRealmId: 'other-realm', projectRealmId: 'realm-1' });

            repository.seed(pn);

            await expect(
                service.update(
                    pn.id,
                    { approvalStatus: ProjectNodeApprovalStatus.APPROVED },
                    createScopedActor({ realmId: 'realm-1', realmScope: 'own' }),
                ),
            ).rejects.toThrow(PermissionError);
            expect(repository.getAll()[0].approvalStatus).toBeNull();
        });

        it('should evaluate both the stored and the merged row', async () => {
            const pn = createTestProjectNode({ nodeRealmId: 'realm-1' });

            repository.seed(pn);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });

            await service.update(pn.id, { approvalStatus: ProjectNodeApprovalStatus.APPROVED }, actor);

            const statuses = actor.permissionEvaluator.evaluateCalls
                .map((call) => call.data?.get<ProjectNode>(BuiltInPolicyType.ATTRIBUTES)?.approvalStatus);

            expect(statuses).toEqual([null, ProjectNodeApprovalStatus.APPROVED]);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const pn = createTestProjectNode({
                projectId,
                nodeRealmId: 'realm-1',
                projectRealmId: 'realm-1',
            });

            repository.seed(pn);

            const result = await service.delete(pn.id, createAllowAllActor());

            expect(result.id).toBe(pn.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny when actor lacks permission', async () => {
            const pn = createTestProjectNode();

            repository.seed(pn);

            await expect(
                service.delete(pn.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        it('should delete when the actor holds PROJECT_UPDATE', async () => {
            const pn = createTestProjectNode({ projectId });

            repository.seed(pn);

            const result = await service.delete(
                pn.id,
                createPermissionActor({
                    realm: { id: 'realm-1', name: 'realm-1' },
                    permissions: [PermissionName.PROJECT_UPDATE],
                }),
            );

            expect(result.id).toBe(pn.id);
        });

        // Removing a node changes an existing project: PROJECT_CREATE alone
        // must not detach nodes from projects the actor cannot update.
        it('should deny delete when the actor holds only PROJECT_CREATE', async () => {
            const pn = createTestProjectNode({ projectId });

            repository.seed(pn);

            await expect(
                service.delete(
                    pn.id,
                    createPermissionActor({
                        realm: { id: 'realm-1', name: 'realm-1' },
                        permissions: [PermissionName.PROJECT_CREATE],
                    }),
                ),
            ).rejects.toThrow(PermissionError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny delete when the grant reaches neither the node nor the project realm', async () => {
            const pn = createTestProjectNode({
                nodeRealmId: 'other-realm',
                projectRealmId: 'another-realm',
            });

            repository.seed(pn);

            await expect(
                service.delete(pn.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should allow delete when the grant reaches the node realm', async () => {
            const pn = createTestProjectNode({
                projectId,
                nodeRealmId: 'realm-1',
                projectRealmId: 'other-realm',
            });

            repository.seed(pn);

            const result = await service.delete(pn.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' }));

            expect(result.id).toBe(pn.id);
        });

        it('should allow delete when the grant reaches the project realm', async () => {
            const pn = createTestProjectNode({
                projectId,
                nodeRealmId: 'other-realm',
                projectRealmId: 'realm-1',
            });

            repository.seed(pn);

            const result = await service.delete(pn.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' }));

            expect(result.id).toBe(pn.id);
        });

        it('should decrement project nodes count', async () => {
            const project = await projectRepository.findOneBy({ id: projectId });

            project!.nodes = 3;
            await projectRepository.save(project!);

            const pn = createTestProjectNode({
                projectId,
                nodeRealmId: 'realm-1',
            });

            repository.seed(pn);

            await service.delete(pn.id, createAllowAllActor());

            const updated = await projectRepository.findOneBy({ id: projectId });

            expect(updated!.nodes).toBe(2);
        });
    });
});
