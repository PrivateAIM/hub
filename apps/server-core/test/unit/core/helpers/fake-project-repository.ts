/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';
import type { IProjectRepository } from '../../../../src/core/entities/project/types.ts';
import { FakeEntityRepository } from './fake-repository.ts';

export class FakeProjectRepository extends FakeEntityRepository<Project> implements IProjectRepository {
    async checkUniqueness(): Promise<void> {
        // no-op in fake
    }
}
