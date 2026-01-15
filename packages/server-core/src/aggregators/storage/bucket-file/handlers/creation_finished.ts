/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useLogger } from '@privateaim/server-kit';
import type { BucketFileComponentEventMap, BucketFileEvent } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import {
    AnalysisBucketEntity, AnalysisBucketFileEntity, useDataSourceSync,
} from '../../../../database/index.ts';
import { BaseAggregatorHandler } from '../../../base.ts';

export class StorageBucketFileCreationFinishedHandler extends BaseAggregatorHandler<
BucketFileComponentEventMap,
BucketFileEvent.CREATION_FINISHED
> {
    async handle(data: BucketFile): Promise<void> {
        const dataSource = useDataSourceSync();
        const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        const analysisBucket = await analysisBucketRepository.findOneBy({
            bucket_id: data.bucket_id,
        });

        if (!analysisBucket) {
            useLogger().debug(`Can not associate ${data.path} to an analysis bucket`);
            return;
        }

        // todo: check if analysis is locked.

        const analysisBucketFileRepository = dataSource.getRepository(AnalysisBucketFileEntity);
        const analysisBucketFile = analysisBucketFileRepository.create({
            path: data.path,
            analysis_bucket_id: analysisBucket.id,
            analysis_id: analysisBucket.analysis_id,
            realm_id: analysisBucket.realm_id,
            bucket_file_id: data.id,
            bucket_id: data.bucket_id,
        });

        switch (data.actor_type) {
            case 'user': {
                analysisBucketFile.user_id = data.actor_id;
                break;
            }
            case 'robot': {
                analysisBucketFile.robot_id = data.actor_id;
                break;
            }
        }

        await analysisBucketFileRepository.save(analysisBucketFile);
    }
}
