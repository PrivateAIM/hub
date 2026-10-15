/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@privateaim/core-kit';
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import type { BucketComponentEventMap, BucketEvent } from '@privateaim/server-storage-kit';
import type { Bucket } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { TaskType } from '../../../../../core/domains/index.ts';
import type { IAnalysisBucketRepository, IAnalysisRepository } from '../../../../../core/index.ts';
import { BaseAggregatorHandler } from '../../../base.ts';
import type { StorageBucketAggregatorContext } from '../types.ts';

export class StorageBucketCreationFinishedHandler extends BaseAggregatorHandler<
    BucketComponentEventMap,
    BucketEvent.CREATION_FINISHED
> {
    protected analysisRepository: IAnalysisRepository;

    protected analysisBucketRepository: IAnalysisBucketRepository;

    constructor(ctx: StorageBucketAggregatorContext) {
        super(ctx);
        this.analysisRepository = ctx.analysisRepository;
        this.analysisBucketRepository = ctx.analysisBucketRepository;
    }

    async handle(bucket: Bucket, context: ComponentHandlerContext<BucketComponentEventMap, BucketEvent.CREATION_FINISHED>): Promise<void> {
        const task = await this.resolveTask(context);
        if (!task) {
            return;
        }

        if (task.type === TaskType.ANALYSIS_BUCKET_CREATE) {
            let analysisBucket = await this.analysisBucketRepository.findOneBy({
                analysisId: task.data.analysisId,
                type: task.data.bucketType,
            });

            if (analysisBucket) {
                this.logger?.info(`${task.data.bucketType} bucket already exists for analysis`, {
                    [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                    [LogFlag.REF_ID]: task.data.analysisId,
                    bucketType: task.data.bucketType,
                });
                return;
            }

            const analysis = await this.analysisRepository.findOneById(task.data.analysisId);

            if (!analysis) {
                this.logger?.info(`Analysis does not exist; ${task.data.bucketType} bucket cannot be created`, {
                    [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                    [LogFlag.REF_ID]: task.data.analysisId,
                    bucketType: task.data.bucketType,
                });
                return;
            }

            analysisBucket = this.analysisBucketRepository.create({
                type: task.data.bucketType,
                bucketId: bucket.id,
                analysisId: analysis.id,
                realmId: analysis.realmId,
            });

            await this.analysisBucketRepository.save(analysisBucket);
        }
    }
}
