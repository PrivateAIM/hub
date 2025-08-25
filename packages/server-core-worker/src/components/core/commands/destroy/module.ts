/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from 'hapic';
import type { CoreDestroyPayload } from '@privateaim/server-core-worker-kit';
import { useCoreClient, useStorageClient } from '../../../../core';
import { writeBucketDeletedEvent } from '../../queue';

export async function executeCoreDestroyCommand(
    payload: CoreDestroyPayload,
) : Promise<CoreDestroyPayload> {
    const core = useCoreClient();
    const storage = useStorageClient();

    const { data: buckets } = await core.analysisBucket.getMany({
        filters: {
            analysis_id: payload.id,
        },
    });

    for (let i = 0; i < buckets.length; i++) {
        const bucket = buckets[i];

        if (bucket.external_id) {
            try {
                await storage.bucket.delete(bucket.external_id);
            } catch (e) {
                if (isClientErrorWithStatusCode(e, [404])) {
                    continue;
                }

                throw e;
            }
        }

        await writeBucketDeletedEvent({
            id: payload.id,
            bucketType: bucket.type,
            bucketId: bucket.external_id,
        });
    }

    return payload;
}
