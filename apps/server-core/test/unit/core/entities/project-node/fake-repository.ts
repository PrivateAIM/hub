/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import type { IProjectNodeRepository } from '../../../../../src/core/entities/project-node/types.ts';

export class FakeProjectNodeRepository extends FakeEntityRepository<ProjectNode> implements IProjectNodeRepository {
    async findManyWithNodeByProject(projectId: string): Promise<ProjectNode[]> {
        return this.findManyBy({ project_id: projectId });
    }
}
