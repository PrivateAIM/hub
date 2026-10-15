/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentHandler } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketEvent } from '@privateaim/server-storage-kit';
import type { Bucket } from '@privateaim/storage-kit';
import type { IAnalysisBucketRepository } from '../../../../../core/index.ts';
import type { StorageBucketAggregatorContext } from '../types.ts';

export class StorageBucketDeletionFinishedHandler implements ComponentHandler<
    BucketComponentEventMap,
    BucketEvent.DELETION_FINISHED
> {
    protected repository: IAnalysisBucketRepository;

    constructor(ctx: StorageBucketAggregatorContext) {
        this.repository = ctx.analysisBucketRepository;
    }

    async handle(bucket: Bucket): Promise<void> {
        // matched by bucket id alone, so a delete issued over storage's HTTP API
        // detaches the analysis bucket as well.
        const analysisBucket = await this.repository.findOneBy({ bucketId: bucket.id });
        if (!analysisBucket) {
            return;
        }

        await this.repository.remove(analysisBucket);
    }
}
