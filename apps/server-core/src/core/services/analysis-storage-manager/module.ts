/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType, buildAnalysisBucketName } from '@privateaim/core-kit';
import type { IEntityRepository } from '../../entities/types.ts';
import type { IBucketCaller, ITaskManager } from '../types.ts';
import type { AnalysisStorageMangerCheckOptions, AnalysisStorageMangerRemoveOptions } from './types.ts';

type AnalysisStorageManagerContext = {
    repository: IEntityRepository<Analysis>;
    bucketRepository: IEntityRepository<AnalysisBucket>;
    caller: IBucketCaller;
    taskManager: ITaskManager;
};

export class AnalysisStorageManager {
    protected repository: IEntityRepository<Analysis>;

    protected bucketRepository: IEntityRepository<AnalysisBucket>;

    protected caller: IBucketCaller;

    protected taskManager: ITaskManager;

    constructor(ctx: AnalysisStorageManagerContext) {
        this.repository = ctx.repository;
        this.bucketRepository = ctx.bucketRepository;
        this.caller = ctx.caller;
        this.taskManager = ctx.taskManager;
    }

    async check(
        input: string | Analysis,
        options: AnalysisStorageMangerCheckOptions = {},
    ): Promise<Analysis> {
        const entity = await this.resolve(input);

        const bucketTypes = options.type ?
            [options.type] :
            Object.values(AnalysisBucketType);

        for (const bucketType of bucketTypes) {
            const analysisBucket = await this.bucketRepository.findOneBy({
                analysis_id: entity.id,
                type: bucketType,
            });
            if (analysisBucket) {
                continue;
            }

            const correlationId = await this.taskManager.create(
                'analysisBucketCreate',
                { analysisId: entity.id, bucketType },
            );

            await this.caller.callCreate({
                name: buildAnalysisBucketName(bucketType, entity.id),
                realm_id: entity.realm_id,
            }, { correlationId });
        }
        return entity;
    }

    async remove(
        input: string | Analysis,
        options: AnalysisStorageMangerRemoveOptions = {},
    ): Promise<Analysis> {
        const entity = await this.resolve(input);

        const bucketTypes = options.type ?
            [options.type] :
            Object.values(AnalysisBucketType);

        for (const bucketType of bucketTypes) {
            const analysisBucket = await this.bucketRepository.findOneBy({
                analysis_id: entity.id,
                type: bucketType,
            });
            if (!analysisBucket) {
                continue;
            }

            const correlationId = await this.taskManager.create(
                'analysisBucketDelete',
                { analysisId: analysisBucket.analysis_id },
            );

            await this.caller.callDelete({ id: analysisBucket.bucket_id }, { correlationId });
        }

        return entity;
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);
            if (!entity) {
                throw new BadRequestError('Analysis could not be found.');
            }
            return entity;
        }
        return input;
    }
}
