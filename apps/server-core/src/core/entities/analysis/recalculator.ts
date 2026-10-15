/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisRecalcQueue, saveAnalysisPatch } from '../utils.ts';
import type { IAnalysisMetadataRecalculator, IAnalysisRepository } from './types.ts';

export class AnalysisMetadataRecalculator implements IAnalysisMetadataRecalculator {
    protected repository: IAnalysisRepository;

    private queue: AnalysisRecalcQueue;

    constructor(ctx: { repository: IAnalysisRepository }) {
        this.repository = ctx.repository;
        this.queue = new AnalysisRecalcQueue((id) => this.recalc(id));
    }

    async recalc(analysisId: string): Promise<Analysis> {
        const entity = await this.repository.findOneById(analysisId);
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }

        return saveAnalysisPatch(this.repository, entity, { configurationImageValid: !!entity.masterImageId });
    }

    recalcDebounced(analysisId: string): Promise<void> {
        return this.queue.enqueue(analysisId);
    }
}
