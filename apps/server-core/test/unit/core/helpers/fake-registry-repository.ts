/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import type { IRegistryRepository } from '../../../../src/core/entities/registry/types.ts';
import { FakeEntityRepository } from './fake-repository.ts';

export class FakeRegistryRepository extends FakeEntityRepository<Registry> implements IRegistryRepository {
    async findOneWithSecret(id: string): Promise<Registry | null> {
        return this.findOneById(id);
    }
}
