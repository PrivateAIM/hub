/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBucketType,
    buildAnalysisBucketName,
} from '@privateaim/core';
import type { CoreConfigurePayload } from '@privateaim/server-analysis-manager-kit';
import { useCoreClient, useStorageClient } from '../../../../core';
import { writeBucketCreatedEvent } from '../../queue';

export async function executeCoreConfigureCommand(
    payload: CoreConfigurePayload,
) : Promise<CoreConfigurePayload> {
    const coreClient = useCoreClient();

    const bucketTypes = Object.values(AnalysisBucketType);
    const { data: buckets } = await coreClient.analysisBucket.getMany({
        filters: {
            analysis_id: payload.id,
        },
    });

    for (let i = 0; i < buckets.length; i++) {
        const bucket = buckets[i];

        const index = bucketTypes.indexOf(bucket.type as AnalysisBucketType);
        if (index !== -1) {
            bucketTypes.splice(index, 1);
        }
    }

    const storage = useStorageClient();

    for (let i = 0; i < bucketTypes.length; i++) {
        const name = buildAnalysisBucketName(bucketTypes[i], payload.id);

        // todo: createOrUpdate
        // todo: handleConflict (maybe random name)
        const bucket = await storage.bucket.create({ name });

        await writeBucketCreatedEvent({
            id: payload.id,
            bucketId: bucket.id,
            bucketType: bucketTypes[i],
        });
    }

    return payload;
}
