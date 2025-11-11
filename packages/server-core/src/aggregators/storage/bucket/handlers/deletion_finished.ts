/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import type { Bucket } from '@privateaim/storage-kit/src';
import { AnalysisBucketEntity, useDataSourceSync } from '../../../../database';
import { TaskType, useTaskManager } from '../../../../domains';

export class StorageBucketDeletionFinishedHandler implements ComponentHandler {
    async handle(bucket: Bucket, context: ComponentHandlerContext): Promise<void> {
        const { correlationId } = context.metadata;
        if (!correlationId) {
            return;
        }

        const taskManager = useTaskManager();
        const task = await taskManager.resolve(correlationId);
        if (
            task &&
            task.type === TaskType.ANALYSIS_STORAGE_DELETE
        ) {
            const dataSource = useDataSourceSync();
            const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
            const analysisBucket = await analysisBucketRepository.findOneBy({
                analysis_id: task.data.analysisId,
                external_id: bucket.id,
            });

            if (!analysisBucket) {
                return;
            }

            await analysisBucketRepository.remove(analysisBucket);
        }
    }
}
