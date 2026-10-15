/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { AnalysisBucketType, AnalysisNodeApprovalStatus, DomainType } from '@privateaim/core-kit';
import type { BucketFileComponentEventMap, BucketFileEvent, BucketFileTaskCaller } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
} from '../../../../../adapters/database/index.ts';
import type { BaseAggregatorHandlerContext } from '../../../base.ts';
import { BaseAggregatorHandler } from '../../../base.ts';

export class StorageBucketFileCreationFinishedHandler extends BaseAggregatorHandler<
    BucketFileComponentEventMap,
    BucketFileEvent.CREATION_FINISHED
> {
    protected bucketFileCaller?: BucketFileTaskCaller;

    constructor(ctx: BaseAggregatorHandlerContext & { bucketFileCaller?: BucketFileTaskCaller }) {
        super(ctx);
        this.bucketFileCaller = ctx.bucketFileCaller;
    }

    async handle(data: BucketFile): Promise<void> {
        const analysisBucketRepository = this.dataSource.getRepository(AnalysisBucketEntity);
        const analysisBucket = await analysisBucketRepository.findOneBy({ bucketId: data.bucketId });

        if (!analysisBucket) {
            this.logger?.debug(`Can not associate ${data.path} to an analysis bucket`);
            return;
        }

        const reason = await this.reject(data, analysisBucket);
        if (reason) {
            this.logger?.warn(`File ${data.path} not registered: ${reason}`, {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                [LogFlag.REF_ID]: analysisBucket.analysisId,
            });

            // An unregistered object in a code bucket breaks every later build, so it is removed.
            // RESULT/TEMP objects are kept: a misjudged uploader must not cost result data.
            if (analysisBucket.type === AnalysisBucketType.CODE) {
                await this.bucketFileCaller?.callDelete({ id: data.id });
            }
            return;
        }

        const analysisBucketFileRepository = this.dataSource.getRepository(AnalysisBucketFileEntity);
        const analysisBucketFile = analysisBucketFileRepository.create({
            path: data.path,
            analysisBucketId: analysisBucket.id,
            analysisId: analysisBucket.analysisId,
            realmId: analysisBucket.realmId,
            bucketFileId: data.id,
            bucketId: data.bucketId,
        });

        switch (data.actorType) {
            case 'user': {
                analysisBucketFile.userId = data.actorId;
                break;
            }
            case 'client': {
                analysisBucketFile.clientId = data.actorId;
                break;
            }
        }

        await analysisBucketFileRepository.save(analysisBucketFile);
    }

    /**
     * The upload reached storage unchecked, so the D3 write rules are applied
     * here. ponytail: realm-level only — the uploader's ANALYSIS_UPDATE grant and a
     * master-realm bypass need the uploader's identity resolved through Authup
     * (plan 021 / plan 012 capability tokens).
     */
    protected async reject(data: BucketFile, analysisBucket: AnalysisBucketEntity): Promise<string | undefined> {
        if (analysisBucket.type === AnalysisBucketType.CODE) {
            if (data.realmId !== analysisBucket.realmId) {
                return 'the uploader is not in the analysis realm';
            }

            const analysis = await this.dataSource.getRepository(AnalysisEntity).findOneBy({ id: analysisBucket.analysisId });
            if (analysis?.configurationLocked) {
                return 'the analysis configuration is locked';
            }

            return undefined;
        }

        // The analysis' own client sits in the owner realm; it participates by binding (plan 021 D8).
        if (data.actorType === 'client') {
            const analysis = await this.dataSource.getRepository(AnalysisEntity).findOneBy({ id: analysisBucket.analysisId });
            if (analysis?.clientId && analysis.clientId === data.actorId) {
                return undefined;
            }
        }

        // typeorm drops an undefined key, which would match any approved node.
        if (!data.realmId) {
            return 'the uploader has no realm';
        }

        const participant = await this.dataSource.getRepository(AnalysisNodeEntity).findOneBy({
            analysisId: analysisBucket.analysisId,
            nodeRealmId: data.realmId,
            approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
        });

        return participant ? undefined : 'the uploader is not an approved analysis node';
    }
}
