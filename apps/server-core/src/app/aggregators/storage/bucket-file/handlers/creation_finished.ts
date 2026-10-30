/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { AnalysisBucketType, DomainType } from '@privateaim/core-kit';
import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler } from 'hubwire';
import type { BucketFileComponentEventMap, BucketFileTaskDispatcher } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { IAnalysisBucketFileService } from '../../../../../core/index.ts';
import type { StorageBucketFileAggregatorContext } from '../types.ts';

export class StorageBucketFileCreationFinishedHandler implements ComponentHandler<BucketFileComponentEventMap> {
    protected service: IAnalysisBucketFileService;

    protected bucketFileDispatcher?: BucketFileTaskDispatcher;

    protected logger?: Logger;

    constructor(ctx: StorageBucketFileAggregatorContext) {
        this.service = ctx.service;
        this.bucketFileDispatcher = ctx.bucketFileDispatcher;
        this.logger = ctx.logger;
    }

    async handle(data: BucketFile): Promise<void> {
        const result = await this.service.registerUpload(data);

        if (!result) {
            this.logger?.debug(`Can not associate ${data.path} to an analysis bucket`);

            return;
        }

        if (!result.rejection) {
            return;
        }

        this.logger?.warn(`File ${data.path} not registered: ${result.rejection}`, {
            [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
            [LogFlag.REF_ID]: result.bucket.analysisId,
        });

        // An unregistered object in a code bucket breaks every later build, so it is removed.
        // RESULT/TEMP objects are kept: a misjudged uploader must not cost result data.
        if (result.bucket.type === AnalysisBucketType.CODE) {
            await this.bucketFileDispatcher?.dispatchDelete({ id: data.id });
        }
    }
}
