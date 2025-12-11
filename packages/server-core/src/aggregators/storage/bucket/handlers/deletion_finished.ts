/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketEvent } from '@privateaim/server-storage-kit';
import type { Bucket } from '@privateaim/storage-kit/src';
import { AnalysisBucketEntity, useDataSourceSync } from '../../../../database';
import { TaskType } from '../../../../domains';
import { BaseAggregatorHandler } from '../../../base';

export class StorageBucketDeletionFinishedHandler extends BaseAggregatorHandler<
BucketComponentEventMap,
BucketEvent.DELETION_FINISHED
> {
    async handle(bucket: Bucket, context: ComponentHandlerContext<BucketComponentEventMap, BucketEvent.DELETION_FINISHED>): Promise<void> {
        const task = await this.resolveTask(context);
        if (!task) {
            return;
        }

        if (task.type === TaskType.ANALYSIS_BUCKET_DELETE) {
            const dataSource = useDataSourceSync();
            const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
            const analysisBucket = await analysisBucketRepository.findOneBy({
                analysis_id: task.data.analysisId,
                bucket_id: bucket.id,
            });

            if (!analysisBucket) {
                return;
            }

            await analysisBucketRepository.remove(analysisBucket);
        }
    }
}
