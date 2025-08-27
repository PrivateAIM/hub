/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import type { BuilderBuildPayload } from '@privateaim/server-core-worker-kit';
import { BuilderCommand, BuilderEvent, buildBuilderEventQueueRouterPayload } from '@privateaim/server-core-worker-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useBuilderLogger } from '../utils';

export async function writeBuildFailedEvent(
    data: BuilderBuildPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.BUILD_FAILED,
        data,
    }));

    useBuilderLogger().error({
        message: `Build failed for analysis ${data.id}`,
        ...(data.error ? data.error : {}),
        command: BuilderCommand.BUILD,
        analysis_id: data.id,
        [LogFlag.REF_ID]: data.id,
        event: BuilderEvent.BUILD_FAILED,
    });
}
