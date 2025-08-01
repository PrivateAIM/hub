/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    CoreCommand,
    CoreEvent,
    buildCoreEventQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import type {
    CoreConfigurePayload,
} from '@privateaim/server-analysis-manager-kit';
import { useCoreLogger } from '../utils';

export async function writeConfiguringEvent(
    data: CoreConfigurePayload,
) {
    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: CoreEvent.CONFIGURING,
        command: CoreCommand.CONFIGURE,
        data,
    }));

    useCoreLogger().info({
        message: `Configured analysis ${data.id}`,
        command: CoreCommand.CONFIGURE,
        analysis_id: data.id,
        event: CoreEvent.CONFIGURING,
    });

    return data;
}
