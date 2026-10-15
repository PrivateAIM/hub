/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    BucketClearingFinishedEventPayload,
    BucketComponentEventMap,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import type { IAnalysisBucketFileRepository } from '../../../../../core/index.ts';
import { BaseAggregatorHandler } from '../../../base.ts';
import type { StorageBucketAggregatorContext } from '../types.ts';

export class StorageBucketClearingFinishedHandler extends BaseAggregatorHandler<
    BucketComponentEventMap,
    BucketEvent.CLEARING_FINISHED
> {
    protected repository: IAnalysisBucketFileRepository;

    constructor(ctx: StorageBucketAggregatorContext) {
        super(ctx);
        this.repository = ctx.analysisBucketFileRepository;
    }

    async handle(payload: BucketClearingFinishedEventPayload): Promise<void> {
        // only the files the clear removed: one uploaded meanwhile still exists in storage.
        if (!payload.fileIds || payload.fileIds.length === 0) {
            return;
        }

        const entities = await this.repository.findManyByBucketFiles(payload.id, payload.fileIds);
        if (entities.length === 0) {
            return;
        }

        // remove (not delete) so the subscribers publish a realtime event per file.
        await this.repository.removeMany(entities);
    }
}
