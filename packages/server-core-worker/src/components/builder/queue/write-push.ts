/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import type { BuilderBuildPayload, BuilderPushPayload } from '@privateaim/server-core-worker-kit';
import {
    BuilderCommand,
    buildBuilderTaskQueueRouterPayload,
} from '@privateaim/server-core-worker-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useBuilderLogger } from '../utils';

export async function writePushCommand(
    data: BuilderPushPayload,
) : Promise<BuilderBuildPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderTaskQueueRouterPayload({
        command: BuilderCommand.PUSH,
        data,
    }));

    useBuilderLogger().info({
        message: `Push analysis ${data.id}`,
        command: BuilderCommand.PUSH,
        analysis_id: data.id,
        [LogFlag.REF_ID]: data.id,
    });

    return data;
}
