/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { BucketFileComponentEventMap, BucketFileEvent } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
} from '../../../../../adapters/database/index.ts';
import { BaseAggregatorHandler } from '../../../base.ts';

export class StorageBucketFileCreationFinishedHandler extends BaseAggregatorHandler<
    BucketFileComponentEventMap,
    BucketFileEvent.CREATION_FINISHED
> {
    async handle(data: BucketFile): Promise<void> {
        const analysisBucketRepository = this.dataSource.getRepository(AnalysisBucketEntity);
        const analysisBucket = await analysisBucketRepository.findOneBy({ bucketId: data.bucketId });

        if (!analysisBucket) {
            this.logger?.debug(`Can not associate ${data.path} to an analysis bucket`);
            return;
        }

        // todo: check if analysis is locked.

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
            case 'robot': {
                analysisBucketFile.robotId = data.actorId;
                break;
            }
        }

        await analysisBucketFileRepository.save(analysisBucketFile);
    }
}
