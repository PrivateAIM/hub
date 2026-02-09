/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import {
    AnalysisBucketType,
    buildAnalysisBucketName,
} from '@privateaim/core-kit';
import type { TaskManager } from '@privateaim/server-kit';
import { BucketComponentCaller } from '@privateaim/server-storage-kit';
import type { Repository } from 'typeorm';
import type { TaskMap } from '../../domains/index.ts';
import { TaskType, useTaskManager } from '../../domains/index.ts';
import type {
    AnalysisStorageManagerContext,
    AnalysisStorageMangerCheckOptions,
    AnalysisStorageMangerRemoveOptions,
} from './types.ts';

export class AnalysisStorageManager {
    protected repository: Repository<Analysis>;

    protected bucketRepository: Repository<AnalysisBucket>;

    protected caller : BucketComponentCaller;

    protected taskManager : TaskManager<TaskMap>;

    constructor(ctx: AnalysisStorageManagerContext) {
        this.repository = ctx.repository;
        this.bucketRepository = ctx.bucketRepository;

        this.caller = new BucketComponentCaller();
        this.taskManager = useTaskManager();
    }

    async check(
        input: string | Analysis,
        options: AnalysisStorageMangerCheckOptions = {},
    ) : Promise<Analysis> {
        const entity = await this.resolve(input);

        const bucketTypes = options.type ?
            [options.type] :
            Object.values(AnalysisBucketType);

        for (let i = 0; i < bucketTypes.length; i++) {
            const analysisBucket = await this.bucketRepository.findOneBy({
                analysis_id: entity.id,
                type: bucketTypes[i],
            });
            if (analysisBucket) {
                continue;
            }

            // todo: maybe extract actor_id, actor_type from event.queryRunner.data
            const correlationId = await this.taskManager.create(
                TaskType.ANALYSIS_BUCKET_CREATE,
                {
                    analysisId: entity.id,
                    bucketType: bucketTypes[i],
                },
            );

            await this.caller.callCreate({
                name: buildAnalysisBucketName(bucketTypes[i], entity.id),
                realm_id: entity.realm_id,
            }, {
                correlationId,
            });
        }
        return entity;
    }

    async remove(
        input: string | Analysis,
        options: AnalysisStorageMangerRemoveOptions = {},
    ) :Promise<Analysis> {
        const entity = await this.resolve(input);

        const bucketTypes = options.type ?
            [options.type] :
            Object.values(AnalysisBucketType);

        for (let i = 0; i < bucketTypes.length; i++) {
            const analysisBucket = await this.bucketRepository.findOneBy({
                analysis_id: entity.id,
                type: bucketTypes[i],
            });
            if (!analysisBucket) {
                continue;
            }

            const correlationId = await this.taskManager.create(
                TaskType.ANALYSIS_BUCKET_DELETE,
                {
                    analysisId: analysisBucket.analysis_id,
                },
            );

            await this.caller.callDelete({
                id: analysisBucket.bucket_id,
            }, {
                correlationId,
            });
        }

        return entity;
    }

    // ---------------------------------------------------------------

    protected async resolve(input: string | Analysis) : Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneBy({ id: input });
            if (!entity) {
                throw new BadRequestError('Analysis could not be found.');
            }

            return entity;
        }

        return input;
    }
}
