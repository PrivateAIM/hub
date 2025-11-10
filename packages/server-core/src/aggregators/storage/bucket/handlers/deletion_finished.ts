/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import type { BucketDeletionFinishedEventPayload, BucketEvent } from '@privateaim/server-storage-kit';
import type { Bucket } from '@privateaim/storage-kit/src';
import { AnalysisBucketEntity, useDataSourceSync } from '../../../../database';

export class StorageBucketDeletionFinishedHandler implements ComponentHandler<
BucketEvent.DELETION_FINISHED,
BucketDeletionFinishedEventPayload> {
    async handle(bucket: Bucket, context: ComponentHandlerContext<BucketEvent.DELETION_FINISHED>): Promise<void> {
        const { analysisBucketId } = context.metadata;
        if (!analysisBucketId) {
            return;
        }

        const dataSource = useDataSourceSync();
        const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        const analysisBucket = await analysisBucketRepository.findOneBy({
            id: analysisBucketId,
        });

        if (!analysisBucket) {
            return;
        }

        await analysisBucketRepository.remove(analysisBucket);
    }
}
