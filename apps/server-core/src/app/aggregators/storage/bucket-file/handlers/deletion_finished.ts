/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@privateaim/core-kit';
import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler } from 'hubwire';
import type { BucketFileComponentEventMap } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { IAnalysisBucketFileService } from '../../../../../core/index.ts';
import type { StorageBucketFileAggregatorContext } from '../types.ts';

export class StorageBucketFileDeletionFinishedHandler implements ComponentHandler<BucketFileComponentEventMap> {
    protected service: IAnalysisBucketFileService;

    protected logger?: Logger;

    constructor(ctx: StorageBucketFileAggregatorContext) {
        this.service = ctx.service;
        this.logger = ctx.logger;
    }

    async handle(data: BucketFile): Promise<void> {
        const removal = await this.service.unregisterUpload(data.bucketId, data.id);
        if (!removal) {
            return;
        }

        if (removal.frozen) {
            this.logger?.error(`Code file ${removal.entity.path} was deleted from storage after the configuration was locked`, {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                [LogFlag.REF_ID]: removal.entity.analysisId,
            });
        }

        this.logger?.debug(`Removed analysis bucket file ${removal.entity.path}`);
    }
}
