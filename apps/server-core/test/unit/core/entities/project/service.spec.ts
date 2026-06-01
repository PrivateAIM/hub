/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../../helpers/index.ts';
import { FakeProjectRepository } from './fake-repository.ts';

function createTestProject(overrides?: Partial<Project>): Project {
    return {
        id: 'project-1',
        name: 'test-project',
        description: null,
        nodes: 0,
        analyses: 0,
        created_at: new Date(),
        updated_at: new Date(),
        realm_id: 'realm-1',
        client_id: null,
        robot_id: null,
        user_id: 'user-1',
        master_image_id: null,
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

        it('should keep a provided name and display_name', async () => {
            const result = await service.create(
                { name: 'my-project', display_name: 'My Project' },
                createAllowAllActor(),
            );

            expect(result.name).toBe('my-project');
            expect(result.display_name).toBe('My Project');
        });

        it('should reject a name that is not url-friendly', async () => {
            await expect(
                service.create({ name: 'Not A Slug!' }, createAllowAllActor()),
            ).rejects.toThrow(/name is invalid/i);
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

        it('should enforce realm writability for non-master realm', async () => {
            repository.seed(createTestProject({ realm_id: 'other-realm' }));

            const actor = createNonMasterRealmActor('realm-1');
            await expect(
                service.delete('project-1', actor),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should allow master realm to delete any project', async () => {
            repository.seed(createTestProject({ realm_id: 'other-realm' }));

            const result = await service.delete('project-1', createMasterRealmActor());
            expect(result.id).toBe('project-1');
        });
    });
});
