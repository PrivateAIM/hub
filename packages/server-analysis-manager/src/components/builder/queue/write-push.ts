/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import type {
    BuilderBuildPayload, BuilderPushPayload,
} from '@privateaim/server-analysis-manager-kit';
import {
    BuilderCommand,
    buildBuilderTaskQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';

export async function writePushCommand(
    data: BuilderPushPayload,
) : Promise<BuilderBuildPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderTaskQueueRouterPayload({
        command: BuilderCommand.PUSH,
        data,
    }));

    return data;
}
