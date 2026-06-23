/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { IRegistryProjectRepository } from '../../../../../src/core/entities/registry-project/types.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';

export class FakeRegistryProjectRepository extends FakeEntityRepository<RegistryProject> implements IRegistryProjectRepository {
    async findOneWithSecret(id: string): Promise<RegistryProject | null> {
        return this.findOneById(id);
    }
}
