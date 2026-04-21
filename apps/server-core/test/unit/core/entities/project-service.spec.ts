/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type { Project } from '@privateaim/core-kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { ProjectService } from '../../../../src/core/entities/project/service.ts';
import {
    FakeProjectRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../helpers/index.ts';

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

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
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

        it('should throw ForbiddenError when actor lacks permission', async () => {
            repository.seed(createTestProject());

            await expect(
                service.delete('project-1', createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            repository.seed(createTestProject({ realm_id: 'other-realm' }));

            const actor = createNonMasterRealmActor('realm-1');
            await expect(
                service.delete('project-1', actor),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should allow master realm to delete any project', async () => {
            repository.seed(createTestProject({ realm_id: 'other-realm' }));

            const result = await service.delete('project-1', createMasterRealmActor());
            expect(result.id).toBe('project-1');
        });
    });
});
