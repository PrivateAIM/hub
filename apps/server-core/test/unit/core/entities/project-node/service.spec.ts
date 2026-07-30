/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Node, Project, ProjectNode } from '@privateaim/core-kit';
import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { ProjectNodeService } from '../../../../../src/core/entities/project-node/service.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../../helpers/index.ts';
import { FakeProjectRepository } from '../project/fake-repository.ts';

function createFakeProjectNodeRepository(projectRealmId: string, nodeRealmId: string) {
    const repo = new FakeEntityRepository<ProjectNode>();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<ProjectNode>) => {
        await originalValidateJoinColumns(data);

        if (!data.project) {
            data.project = {
                id: data.projectId,
                realmId: projectRealmId,
                nodes: 0,
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
    let repository: FakeEntityRepository<ProjectNode>;
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
                createMasterRealmActor('realm-1'),
            );

            expect(result.projectId).toBe(projectId);
            expect(result.nodeId).toBe(nodeId);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should set realm IDs from joined entities', async () => {
            const result = await service.create(
                { projectId, nodeId },
                createMasterRealmActor('realm-1'),
            );

            expect(result.projectRealmId).toBe('realm-1');
            expect(result.nodeRealmId).toBe('realm-1');
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            await expect(
                service.create(
                    { projectId, nodeId },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw PermissionDeniedError when actor cannot write to project realm', async () => {
            const foreignRepo = createFakeProjectNodeRepository('other-realm', 'realm-1');

            const foreignService = new ProjectNodeService({
                repository: foreignRepo,
                projectRepository,
                skipProjectApproval: false,
            });

            await expect(
                foreignService.create(
                    { projectId, nodeId },
                    createNonMasterRealmActor('realm-1'),
                ),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should auto-approve when skipProjectApproval is true', async () => {
            const approvalService = new ProjectNodeService({
                repository,
                projectRepository,
                skipProjectApproval: true,
            });

            const result = await approvalService.create(
                { projectId, nodeId },
                createMasterRealmActor('realm-1'),
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
                createMasterRealmActor('realm-1'),
            );

            expect(result.approvalStatus).toBe(ProjectNodeApprovalStatus.APPROVED);
        });

        it('should increment project nodes count', async () => {
            await service.create(
                { projectId, nodeId },
                createMasterRealmActor('realm-1'),
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
                createMasterRealmActor(),
            );

            expect(result.approvalStatus).toBe(ProjectNodeApprovalStatus.APPROVED);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', {}, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const pn = createTestProjectNode();
            repository.seed(pn);

            await expect(
                service.update(pn.id, {}, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should enforce node realm writability', async () => {
            const pn = createTestProjectNode({ nodeRealmId: 'other-realm' });
            repository.seed(pn);

            await expect(
                service.update(pn.id, {}, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
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

            const result = await service.delete(pn.id, createMasterRealmActor());
            expect(result.id).toBe(pn.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const pn = createTestProjectNode();
            repository.seed(pn);

            await expect(
                service.delete(pn.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw PermissionDeniedError when not authority of node or project realm', async () => {
            const pn = createTestProjectNode({
                nodeRealmId: 'other-realm',
                projectRealmId: 'another-realm',
            });
            repository.seed(pn);

            await expect(
                service.delete(pn.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should allow delete when actor is authority of node realm', async () => {
            const pn = createTestProjectNode({
                projectId,
                nodeRealmId: 'realm-1',
                projectRealmId: 'other-realm',
            });
            repository.seed(pn);

            const result = await service.delete(pn.id, createNonMasterRealmActor('realm-1'));
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

            await service.delete(pn.id, createMasterRealmActor());

            const updated = await projectRepository.findOneBy({ id: projectId });
            expect(updated!.nodes).toBe(2);
        });
    });
});
