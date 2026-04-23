/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import type { IAnalysisNodeRepository } from '../../../../src/core/entities/analysis-node/types.ts';
import { FakeEntityRepository } from './fake-repository.ts';

export class FakeAnalysisNodeRepository extends FakeEntityRepository<AnalysisNode> implements IAnalysisNodeRepository {
    async findManyWithNodeByAnalysis(analysisId: string): Promise<AnalysisNode[]> {
        return this.findManyBy({ analysis_id: analysisId });
    }
}
