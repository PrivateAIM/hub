/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useLogger } from '@privateaim/server-kit';
import type { BucketFileComponentEventMap, BucketFileEvent } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { AnalysisBucketFileEntity, useDataSourceSync } from '../../../../database/index.ts';
import { BaseAggregatorHandler } from '../../../base.ts';

export class StorageBucketFileDeletionFinishedHandler extends BaseAggregatorHandler<
BucketFileComponentEventMap,
BucketFileEvent.DELETION_FINISHED
> {
    async handle(data: BucketFile): Promise<void> {
        const dataSource = useDataSourceSync();
        const analysisBucketFileRepository = dataSource.getRepository(AnalysisBucketFileEntity);
        const analysisBucketFile = await analysisBucketFileRepository.findOneBy({
            bucket_file_id: data.id,
        });

        if (!analysisBucketFile) {
            return;
        }

        await analysisBucketFileRepository.remove(analysisBucketFile);

        useLogger().debug(`Removed analysis bucket file ${analysisBucketFile.path}`);
    }
}
