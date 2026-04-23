/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisBucketFile } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IAnalysisBucketFileRepository extends IEntityRepository<AnalysisBucketFile> {
    findRootCodeFile(analysisId: string): Promise<AnalysisBucketFile | null>;
}

export interface IAnalysisFileMetadataRecalculator {
    recalc(analysisId: string): Promise<Analysis>;
    recalcDebounced(analysisId: string): Promise<void>;
}

export interface IAnalysisBucketFileService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucketFile>>;
    getOne(id: string): Promise<AnalysisBucketFile>;
    create(data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile>;
    update(id: string, data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile>;
    delete(id: string, actor: ActorContext): Promise<AnalysisBucketFile>;
}
