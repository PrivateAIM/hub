/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisRecalcQueue, hasAnalysisChanged } from '../utils.ts';
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

        const cloned = { ...entity };
        entity.configuration_image_valid = !!entity.master_image_id;

        if (hasAnalysisChanged(cloned, entity)) {
            await this.repository.save(entity);
        }

        return entity;
    }

    recalcDebounced(analysisId: string): Promise<void> {
        return this.queue.enqueue(analysisId);
    }
}
