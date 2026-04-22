/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { DataSource } from 'typeorm';
import type { IAnalysisMetadataRecalculator } from '../../core/entities/analysis/types.ts';
import { AnalysisEntity } from '../database/index.ts';
import type { AnalysisMetadataRecalculatorContext } from './types.ts';
import { RecalcQueue, hasChanged } from './utils.ts';

export class AnalysisSelfMetadataRecalculator implements IAnalysisMetadataRecalculator {
    protected dataSource: DataSource;

    private queue: RecalcQueue;

    constructor(ctx: AnalysisMetadataRecalculatorContext) {
        this.dataSource = ctx.dataSource;
        this.queue = new RecalcQueue((id) => this.recalc(id));
    }

    async recalc(analysisId: string): Promise<Analysis> {
        const repository = this.dataSource.manager.getRepository(AnalysisEntity);
        const entity = await repository.findOneBy({ id: analysisId });
        if (!entity) {
            throw new Error(`Analysis ${analysisId} not found`);
        }

        const cloned = { ...entity };
        entity.configuration_image_valid = !!entity.master_image_id;

        if (hasChanged(cloned, entity)) {
            await repository.save(entity);
        }

        return entity;
    }

    recalcDebounced(analysisId: string): Promise<void> {
        this.queue.enqueue(analysisId);
    }
}
