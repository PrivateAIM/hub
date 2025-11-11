/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { Bucket } from '@privateaim/storage-kit/src';
import { AnalysisBucketEntity, AnalysisEntity, useDataSourceSync } from '../../../../database';

export class StorageBucketCreationFinishedHandler implements ComponentHandler {
    async handle(bucket: Bucket, context: ComponentHandlerContext): Promise<void> {
        const { analysisId, bucketType } = context.metadata;
        if (!analysisId || !bucketType) {
            return;
        }

        const dataSource = useDataSourceSync();
        const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        let analysisBucket = await analysisBucketRepository.findOneBy({
            analysis_id: analysisId,
            type: bucketType,
        });

        if (analysisBucket) {
            useLogger().info(`Analysis ${bucketType} bucket already exists for analysis ${analysisId}.`);
            return;
        }

        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.findOneBy({
            id: analysisId,
        });

        if (!analysis) {
            useLogger().info(`Analysis ${analysisId} does not exist. Therefore ${bucketType} bucket can not be created.`);
            return;
        }

        analysisBucket = analysisBucketRepository.create({
            type: bucketType,
            external_id: bucket.id,
            analysis_id: analysis.id,
            realm_id: analysis.realm_id,
        });

        await analysisBucketRepository.save(analysisBucket);
    }
}
