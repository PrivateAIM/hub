/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CoreBucketEventPayload } from '@privateaim/server-analysis-manager-kit';
import {
    CoreEvent,
} from '@privateaim/server-analysis-manager-kit';
import { type QueueRouterHandlers } from '@privateaim/server-kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisBucketEntity, AnalysisEntity } from '../../../domains';

export function createAnalysisManagerCoreHandlers(): QueueRouterHandlers<{
    [CoreEvent.BUCKET_CREATED]: CoreBucketEventPayload,
    [CoreEvent.BUCKET_DELETED]: CoreBucketEventPayload,
}> {
    return {
        [CoreEvent.BUCKET_CREATED]: async (message) => {
            const dataSource = await useDataSource();
            const analysisRepository = dataSource.getRepository(AnalysisEntity);
            const analysis = await analysisRepository.findOneBy({ id: message.data.id });
            if (!analysis) {
                // todo: log message
                return;
            }
            const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
            const entity = bucketRepository.create({
                analysis_id: message.data.id,
                type: message.data.bucketType,
                external_id: message.data.bucketId,
                realm_id: analysis.realm_id,
            });

            await bucketRepository.save(entity);
        },
        [CoreEvent.BUCKET_DELETED]: async (message) => {
            const dataSource = await useDataSource();
            const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
            const bucket = await bucketRepository.findOneBy({
                type: message.data.bucketType,
                analysis_id: message.data.id,
                // todo: maybe by external_id too
            });

            await bucketRepository.remove(bucket);
        },
    };
}
