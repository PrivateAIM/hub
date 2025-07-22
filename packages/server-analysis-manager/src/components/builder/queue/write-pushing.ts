/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import type { BuilderBuildPayload } from '@privateaim/server-analysis-manager-kit';
import {
    BuilderCommand,
    BuilderEvent, buildBuilderEventQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import { useBuilderLogger } from '../utils';

export async function writePushingEvent(
    data: BuilderBuildPayload,
) : Promise<BuilderBuildPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.PUSHING,
        data, //  { id: 'xxx' }
    }));

    useBuilderLogger().info({
        message: `Pushing analysis ${data.id}`,
        command: BuilderCommand.PUSH,
        analysis_id: data.id,
        event: BuilderEvent.PUSHING,
    });

    return data;
}
