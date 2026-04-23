/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Node, Project, ProjectNode } from '@privateaim/core-kit';
import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { ProjectNodeService } from '../../../../src/core/entities/project-node/service.ts';
import {
    FakeEntityRepository,
    FakeProjectRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../helpers/index.ts';

function createFakeProjectNodeRepository(projectRealmId: string, nodeRealmId: string) {
    const repo = new FakeEntityRepository<ProjectNode>();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<ProjectNode>) => {
        await originalValidateJoinColumns(data);

        if (!data.project) {
            data.project = {
                id: data.project_id,
                realm_id: projectRealmId,
                nodes: 0,
            } as Project;
        }

        if (!data.node) {
            data.node = {
                id: data.node_id,
                name: 'test-node',
                type: NodeType.DEFAULT,
                realm_id: nodeRealmId,
            } as Node;
        }
    };

    return repo;
}

function createTestProjectNode(overrides?: Partial<ProjectNode>): ProjectNode {
    return {
        id: randomUUID(),
        approval_status: null,
        comment: null,
        project_id: randomUUID(),
        project_realm_id: 'realm-1',
        node_id: randomUUID(),
        node_realm_id: 'realm-1',
        created_at: new Date(),
        updated_at: new Date(),
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
            realm_id: 'realm-1',
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

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const result = await service.create(
                { project_id: projectId, node_id: nodeId },
                createMasterRealmActor('realm-1'),
            );

            expect(result.project_id).toBe(projectId);
            expect(result.node_id).toBe(nodeId);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should set realm IDs from joined entities', async () => {
            const result = await service.create(
                { project_id: projectId, node_id: nodeId },
                createMasterRealmActor('realm-1'),
            );

            expect(result.project_realm_id).toBe('realm-1');
            expect(result.node_realm_id).toBe('realm-1');
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.create(
                    { project_id: projectId, node_id: nodeId },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw ForbiddenError when actor cannot write to project realm', async () => {
            const foreignRepo = createFakeProjectNodeRepository('other-realm', 'realm-1');

            const foreignService = new ProjectNodeService({
                repository: foreignRepo,
                projectRepository,
                skipProjectApproval: false,
            });

            await expect(
                foreignService.create(
                    { project_id: projectId, node_id: nodeId },
                    createNonMasterRealmActor('realm-1'),
                ),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should auto-approve when skipProjectApproval is true', async () => {
            const approvalService = new ProjectNodeService({
                repository,
                projectRepository,
                skipProjectApproval: true,
            });

            const result = await approvalService.create(
                { project_id: projectId, node_id: nodeId },
                createMasterRealmActor('realm-1'),
            );

            expect(result.approval_status).toBe(ProjectNodeApprovalStatus.APPROVED);
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
                { project_id: projectId, node_id: nodeId },
                createMasterRealmActor('realm-1'),
            );

            expect(result.approval_status).toBe(ProjectNodeApprovalStatus.APPROVED);
        });

        it('should increment project nodes count', async () => {
            await service.create(
                { project_id: projectId, node_id: nodeId },
                createMasterRealmActor('realm-1'),
            );

            const project = await projectRepository.findOneBy({ id: projectId });
            expect(project!.nodes).toBe(1);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const pn = createTestProjectNode({ node_realm_id: 'realm-1' });
            repository.seed(pn);

            const result = await service.update(
                pn.id,
                { approval_status: ProjectNodeApprovalStatus.APPROVED },
                createMasterRealmActor(),
            );

            expect(result.approval_status).toBe(ProjectNodeApprovalStatus.APPROVED);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', {}, createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const pn = createTestProjectNode();
            repository.seed(pn);

            await expect(
                service.update(pn.id, {}, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should enforce node realm writability', async () => {
            const pn = createTestProjectNode({ node_realm_id: 'other-realm' });
            repository.seed(pn);

            await expect(
                service.update(pn.id, {}, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const pn = createTestProjectNode({
                project_id: projectId,
                node_realm_id: 'realm-1',
                project_realm_id: 'realm-1',
            });
            repository.seed(pn);

            const result = await service.delete(pn.id, createMasterRealmActor());
            expect(result.id).toBe(pn.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const pn = createTestProjectNode();
            repository.seed(pn);

            await expect(
                service.delete(pn.id, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when not authority of node or project realm', async () => {
            const pn = createTestProjectNode({
                node_realm_id: 'other-realm',
                project_realm_id: 'another-realm',
            });
            repository.seed(pn);

            await expect(
                service.delete(pn.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should allow delete when actor is authority of node realm', async () => {
            const pn = createTestProjectNode({
                project_id: projectId,
                node_realm_id: 'realm-1',
                project_realm_id: 'other-realm',
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
                project_id: projectId,
                node_realm_id: 'realm-1',
            });
            repository.seed(pn);

            await service.delete(pn.id, createMasterRealmActor());

            const updated = await projectRepository.findOneBy({ id: projectId });
            expect(updated!.nodes).toBe(2);
        });
    });
});
