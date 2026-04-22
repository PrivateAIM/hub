/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import type { IAnalysisBucketFileRepository } from '../../../../src/core/entities/analysis-bucket-file/types.ts';
import { FakeEntityRepository } from './fake-repository.ts';

export class FakeAnalysisBucketFileRepository extends FakeEntityRepository<AnalysisBucketFile> implements IAnalysisBucketFileRepository {
    async findRootCodeFile(analysisId: string): Promise<AnalysisBucketFile | null> {
        const all = await this.findManyBy({ analysis_id: analysisId });
        return all.find((f) => f.root) ?? null;
    }
}
