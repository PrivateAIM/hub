/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType } from '@authup/access';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { Project } from '@privateaim/core-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { ProjectService } from '../../../../../src/core/entities/project/service.ts';
import {
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '../../helpers/index.ts';
import { FakeProjectRepository } from './fake-repository.ts';

function createTestProject(overrides?: Partial<Project>): Project {
    return {
        id: 'project-1',
        name: 'test-project',
        description: null,
        nodes: 0,
        analyses: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        realmId: 'realm-1',
        clientId: null,
        robotId: null,
        userId: 'user-1',
        masterImageId: null,
        ...overrides,
    } as Project;
}

describe('ProjectService', () => {
    let repository: FakeProjectRepository;
    let service: ProjectService;

    beforeEach(() => {
        repository = new FakeProjectRepository();
        service = new ProjectService({ repository });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestProject({ id: 'p-1' }),
                createTestProject({ id: 'p-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            repository.seed(createTestProject());

            const result = await service.getOne('project-1');
            expect(result.id).toBe('project-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('create', () => {
        it('should auto-generate a url-friendly name when none is provided', async () => {
            const result = await service.create({}, createAllowAllActor());

            expect(result.name).toBeTruthy();
            expect(result.name.length).toBeGreaterThanOrEqual(3);
            expect(result.name).toMatch(/^[a-z0-9-_.]+$/);
        });

        it('should generate a name when an empty name is provided', async () => {
            const result = await service.create({ name: '' }, createAllowAllActor());

            expect(result.name).toBeTruthy();
            expect(result.name).toMatch(/^[a-z0-9-_.]+$/);
        });

        it('should keep a provided name and displayName', async () => {
            const result = await service.create(
                { name: 'my-project', displayName: 'My Project' },
                createAllowAllActor(),
            );

            expect(result.name).toBe('my-project');
            expect(result.displayName).toBe('My Project');
        });

        it('should reject a name that is not url-friendly', async () => {
            await expect(
                service.create({ name: 'Not A Slug!' }, createAllowAllActor()),
            ).rejects.toThrow(/name is invalid/i);
        });

        it('should create in the actor realm only with a grant reaching it', async () => {
            const realmId = randomUUID();

            const result = await service.create({}, createScopedActor({ realmId, realmScope: 'own' }));
            expect(result.realmId).toBe(realmId);

            await expect(
                service.create({}, createScopedActor({ realmScope: 'none' })),
            ).rejects.toThrow(PermissionDeniedError);
            expect(repository.getAll()).toHaveLength(1);
        });
    });

    describe('update', () => {
        it('should deny updating a project in a realm the grant does not reach', async () => {
            repository.seed(createTestProject({ realmId: randomUUID() }));

            await expect(
                service.update('project-1', { displayName: 'renamed' }, createScopedActor({ realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should evaluate both the stored and the merged project', async () => {
            const realmId = randomUUID();
            repository.seed(createTestProject({ realmId }));

            const actor = createScopedActor({ realmId, realmScope: 'own' });
            await service.update('project-1', { displayName: 'renamed' }, actor);

            const displayNames = actor.permissionEvaluator.evaluateCalls
                .map((call) => call.data?.get<Project>(BuiltInPolicyType.ATTRIBUTES)?.displayName);
            expect(displayNames).toEqual([undefined, 'renamed']);
        });
    });

    describe('delete', () => {
        it('should delete project with no analyses', async () => {
            const project = createTestProject();
            project.analyses = 0;
            repository.seed(project);

            const result = await service.delete('project-1', createAllowAllActor());
            expect(result.id).toBe('project-1');
        });

        it('should throw BadRequestError when project still has analyses', async () => {
            const project = createTestProject();
            project.analyses = 3;
            repository.seed(project);

            await expect(
                service.delete('project-1', createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            repository.seed(createTestProject());

            await expect(
                service.delete('project-1', createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny deleting a project in a realm the grant does not reach', async () => {
            repository.seed(createTestProject({ realmId: randomUUID() }));

            await expect(
                service.delete('project-1', createScopedActor({ realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should delete a project in any realm with an any-scoped grant', async () => {
            repository.seed(createTestProject({ realmId: randomUUID() }));

            const result = await service.delete('project-1', createScopedActor({ realmScope: 'any' }));
            expect(result.id).toBe('project-1');
        });
    });
});
