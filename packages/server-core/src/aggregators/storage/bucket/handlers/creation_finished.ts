/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { Bucket } from '@privateaim/storage-kit/src';
import { AnalysisBucketEntity, AnalysisEntity, useDataSourceSync } from '../../../../database';
import { TaskType, useTaskManager } from '../../../../domains';

export class StorageBucketCreationFinishedHandler implements ComponentHandler {
    async handle(bucket: Bucket, context: ComponentHandlerContext): Promise<void> {
        const { correlationId } = context.metadata;
        if (!correlationId) {
            return;
        }

        const taskManager = useTaskManager();
        const task = await taskManager.resolve(correlationId);
        if (
            task &&
            task.type === TaskType.ANALYSIS_BUCKET_CREATE
        ) {
            const dataSource = useDataSourceSync();
            const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
            let analysisBucket = await analysisBucketRepository.findOneBy({
                analysis_id: task.data.analysisId,
                type: task.data.bucketType,
            });

            if (analysisBucket) {
                useLogger().info(`Analysis ${task.data.bucketType} bucket already exists for analysis ${task.data.analysisId}.`);
                return;
            }

            const analysisRepository = dataSource.getRepository(AnalysisEntity);
            const analysis = await analysisRepository.findOneBy({
                id: task.data.analysisId,
            });

            if (!analysis) {
                useLogger().info(`Analysis ${task.data.analysisId} does not exist. Therefore ${task.data.bucketType} bucket can not be created.`);
                return;
            }

            analysisBucket = analysisBucketRepository.create({
                type: task.data.bucketType,
                external_id: bucket.id,
                analysis_id: analysis.id,
                realm_id: analysis.realm_id,
            });

            await analysisBucketRepository.save(analysisBucket);
        }
    }
}
