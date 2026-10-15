/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketEvent } from '@privateaim/server-storage-kit';
import type { Bucket } from '@privateaim/storage-kit';
import type { IAnalysisBucketRepository } from '../../../../../core/index.ts';
import { BaseAggregatorHandler } from '../../../base.ts';
import type { StorageBucketAggregatorContext } from '../types.ts';

export class StorageBucketDeletionFinishedHandler extends BaseAggregatorHandler<
    BucketComponentEventMap,
    BucketEvent.DELETION_FINISHED
> {
    protected repository: IAnalysisBucketRepository;

    constructor(ctx: StorageBucketAggregatorContext) {
        super(ctx);
        this.repository = ctx.analysisBucketRepository;
    }

    async handle(bucket: Bucket, context: ComponentHandlerContext<BucketComponentEventMap, BucketEvent.DELETION_FINISHED>): Promise<void> {
        // releases the pending task (if core triggered the delete); the row is
        // matched by bucket id alone, so a delete issued over storage's HTTP API
        // (no task) detaches the analysis bucket as well.
        await this.resolveTask(context);

        const analysisBucket = await this.repository.findOneBy({ bucketId: bucket.id });
        if (!analysisBucket) {
            return;
        }

        await this.repository.remove(analysisBucket);
    }
}
