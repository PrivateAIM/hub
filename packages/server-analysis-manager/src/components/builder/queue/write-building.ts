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

export async function writeBuildingEvent(
    data: BuilderBuildPayload,
) : Promise<BuilderBuildPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.BUILDING,
        data,
    }));

    useBuilderLogger().info({
        message: `Building analysis ${data.id}`,
        command: BuilderCommand.BUILD,
        analysis_id: data.id,
        event: BuilderEvent.BUILDING,
    });

    return data;
}
