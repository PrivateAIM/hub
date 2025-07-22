/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    CoreCommand, CoreEvent, buildCoreEventQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import type {
    CoreBucketEventPayload,
} from '@privateaim/server-analysis-manager-kit';
import { useCoreLogger } from '../utils';

export async function writeBucketDeletedEvent(
    data: CoreBucketEventPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: CoreEvent.BUCKET_DELETED,
        data,
    }));

    useCoreLogger().info({
        message: `${data.bucketType} bucket ${data.bucketId} destroyed for analysis ${data.id}`,
        command: CoreCommand.DESTROY,
        analysis_id: data.id,
        bucket_id: data.bucketId,
        bucket_type: data.bucketType,
        event: CoreEvent.BUCKET_DELETED,
    });
}
