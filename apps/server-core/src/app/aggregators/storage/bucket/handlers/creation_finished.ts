/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType, parseAnalysisBucketName } from '@privateaim/core-kit';
import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler } from 'synergos';
import type { BucketComponentEventMap, BucketEvent } from '@privateaim/server-storage-kit';
import type { Bucket } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { IAnalysisBucketRepository, IAnalysisRepository } from '../../../../../core/index.ts';
import type { IBucketCaller } from '../../../../../core/services/index.ts';
import type { StorageBucketAggregatorContext } from '../types.ts';

export class StorageBucketCreationFinishedHandler implements ComponentHandler<
    BucketComponentEventMap,
    BucketEvent.CREATION_FINISHED
> {
    protected analysisRepository: IAnalysisRepository;

    protected analysisBucketRepository: IAnalysisBucketRepository;

    protected bucketCaller: IBucketCaller;

    protected logger?: Logger;

    constructor(ctx: StorageBucketAggregatorContext) {
        this.analysisRepository = ctx.analysisRepository;
        this.analysisBucketRepository = ctx.analysisBucketRepository;
        this.bucketCaller = ctx.bucketCaller;
        this.logger = ctx.logger;
    }

    async handle(bucket: Bucket): Promise<void> {
        // the reply names its analysis bucket itself (ref + name): no correlation state needed.
        if (bucket.refType !== DomainType.ANALYSIS) {
            return;
        }

        const parsed = parseAnalysisBucketName(bucket.name);
        if (!parsed || parsed.analysisId !== bucket.refId) {
            return;
        }

        const meta = {
            [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
            [LogFlag.REF_ID]: parsed.analysisId,
            bucketType: parsed.type,
        };

        // no lock: BucketEventMessageBusRouting is an ordered (single-active-consumer) WORK queue.
        // Only an HTTP POST /analysis-buckets can race the save below; it then fails the unique
        // (analysisId, type), the bus retries, and the retry takes the duplicate branch.
        const analysisBucket = await this.analysisBucketRepository.findOneBy({
            analysisId: parsed.analysisId,
            type: parsed.type,
        });

        if (analysisBucket) {
            // a repeated check() created a second storage bucket: remove it, keep the linked one.
            if (analysisBucket.bucketId !== bucket.id) {
                this.logger?.info(`Deleting duplicate ${parsed.type} bucket of analysis`, { ...meta, bucketId: bucket.id });
                await this.bucketCaller.callDelete({ id: bucket.id });
            }
            return;
        }

        const analysis = await this.analysisRepository.findOneById(parsed.analysisId);
        if (!analysis) {
            this.logger?.info(`Analysis does not exist; ${parsed.type} bucket cannot be created`, meta);
            return;
        }

        // the reply is trusted for ref + name only because storage forwards
        // CREATION_FINISHED for core's own (bus) creates, not for HTTP ones.
        // Defence in depth should that change: never link across realms.
        if (bucket.realmId !== analysis.realmId) {
            this.logger?.warn(`Ignoring ${parsed.type} bucket from another realm`, { ...meta, bucketId: bucket.id });
            return;
        }

        await this.analysisBucketRepository.save(this.analysisBucketRepository.create({
            type: parsed.type,
            bucketId: bucket.id,
            analysisId: analysis.id,
            realmId: analysis.realmId,
        }));
    }
}
