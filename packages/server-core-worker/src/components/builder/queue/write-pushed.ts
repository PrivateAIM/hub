/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import type { BuilderBuildPayload } from '@privateaim/server-core-worker-kit';
import {
    BuilderCommand,
    BuilderEvent, buildBuilderEventQueueRouterPayload,
} from '@privateaim/server-core-worker-kit';
import { useBuilderLogger } from '../utils';

export async function writePushedEvent(
    data: BuilderBuildPayload,
) : Promise<BuilderBuildPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.PUSHED,
        data,
    }));

    useBuilderLogger().info({
        message: `Pushed analysis ${data.id}`,
        command: BuilderCommand.PUSH,
        analysis_id: data.id,
        event: BuilderEvent.PUSHED,
    });

    return data;
}
