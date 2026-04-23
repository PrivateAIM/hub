/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { IAnalysisRepository } from '../../../../../src/core/entities/analysis/types.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';

export class FakeAnalysisRepository extends FakeEntityRepository<Analysis> implements IAnalysisRepository {
    async findOneWithProject(id: string): Promise<Analysis | null> {
        return this.findOneById(id);
    }
}
