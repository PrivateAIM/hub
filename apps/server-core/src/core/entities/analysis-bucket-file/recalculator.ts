/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { IAnalysisRepository } from '../analysis/types.ts';
import { AnalysisRecalcQueue, hasAnalysisChanged } from '../utils.ts';
import type { IAnalysisBucketFileRepository, IAnalysisFileMetadataRecalculator } from './types.ts';

type AnalysisFileMetadataRecalculatorContext = {
    analysisRepository: IAnalysisRepository;
    bucketFileRepository: IAnalysisBucketFileRepository;
};

export class AnalysisFileMetadataRecalculator implements IAnalysisFileMetadataRecalculator {
    protected analysisRepository: IAnalysisRepository;

    protected bucketFileRepository: IAnalysisBucketFileRepository;

    private queue: AnalysisRecalcQueue;

    constructor(ctx: AnalysisFileMetadataRecalculatorContext) {
        this.analysisRepository = ctx.analysisRepository;
        this.bucketFileRepository = ctx.bucketFileRepository;
        this.queue = new AnalysisRecalcQueue((id) => this.recalc(id));
    }

    async recalc(analysisId: string): Promise<Analysis> {
        const entity = await this.analysisRepository.findOneById(analysisId);
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }

        const cloned = { ...entity };

        const rootFile = await this.bucketFileRepository.findRootCodeFile(entity.id);
        entity.configuration_entrypoint_valid = !!rootFile;

        if (hasAnalysisChanged(cloned, entity)) {
            await this.analysisRepository.save(entity);
        }

        return entity;
    }

    recalcDebounced(analysisId: string): Promise<void> {
        return this.queue.enqueue(analysisId);
    }
}
