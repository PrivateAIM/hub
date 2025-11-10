/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    AnalysisCoreCommand,
    AnalysisCoreEvent, buildCoreEventQueueRouterPayload,
} from '@privateaim/server-core-worker-kit';
import type {
    CoreBucketEventPayload,
} from '@privateaim/server-core-worker-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useCoreLogger } from '../utils';

export async function writeBucketCreatedEvent(
    data: CoreBucketEventPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: AnalysisCoreEvent.BUCKET_CREATED,
        data,
    }));

    useCoreLogger().info({
        message: `${data.bucketType} bucket ${data.bucketId} created for analysis ${data.id}`,
        command: AnalysisCoreCommand.CONFIGURE,
        analysis_id: data.id,
        [LogFlag.REF_ID]: data.id,
        bucket_id: data.bucketId,
        bucket_type: data.bucketType,
        event: AnalysisCoreEvent.BUCKET_CREATED,
    });
}
