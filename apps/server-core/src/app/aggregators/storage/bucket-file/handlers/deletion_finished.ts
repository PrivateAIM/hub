/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { AnalysisBucketType, DomainType } from '@privateaim/core-kit';
import type { BucketFileComponentEventMap, BucketFileEvent } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { AnalysisBucketEntity, AnalysisBucketFileEntity, AnalysisEntity } from '../../../../../adapters/database/index.ts';
import { BaseAggregatorHandler } from '../../../base.ts';

export class StorageBucketFileDeletionFinishedHandler extends BaseAggregatorHandler<
    BucketFileComponentEventMap,
    BucketFileEvent.DELETION_FINISHED
> {
    async handle(data: BucketFile): Promise<void> {
        const analysisBucketFileRepository = this.dataSource.getRepository(AnalysisBucketFileEntity);
        const analysisBucketFile = await analysisBucketFileRepository.findOneBy({ bucketFileId: data.id });

        if (!analysisBucketFile) {
            return;
        }

        // ponytail: storage lets the uploader delete its own object and knows nothing of the
        // analysis lock, so a locked code file can only be reported here, not kept. Enforcing it
        // needs a storage-side gate (plan 012 capability tokens).
        const analysisBucket = await this.dataSource.getRepository(AnalysisBucketEntity).findOneBy({ id: analysisBucketFile.analysisBucketId });
        if (analysisBucket?.type === AnalysisBucketType.CODE) {
            const analysis = await this.dataSource.getRepository(AnalysisEntity).findOneBy({ id: analysisBucketFile.analysisId });
            if (analysis?.configurationLocked) {
                this.logger?.error(`Code file ${analysisBucketFile.path} was deleted from storage after the configuration was locked`, {
                    [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                    [LogFlag.REF_ID]: analysisBucketFile.analysisId,
                });
            }
        }

        await analysisBucketFileRepository.remove(analysisBucketFile);

        this.logger?.debug(`Removed analysis bucket file ${analysisBucketFile.path}`);
    }
}
