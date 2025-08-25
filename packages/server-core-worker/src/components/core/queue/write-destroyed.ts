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
} from '@privateaim/server-core-worker-kit';
import type {
    CoreDestroyPayload,
} from '@privateaim/server-core-worker-kit';
import { useCoreLogger } from '../utils';

export async function writeDestroyedEvent(
    data: CoreDestroyPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: CoreEvent.DESTROYED,
        command: CoreCommand.DESTROY,
        data,
    }));

    useCoreLogger().info({
        message: `Destroyed analysis ${data.id}`,
        command: CoreCommand.DESTROY,
        analysis_id: data.id,
        event: CoreEvent.DESTROYED,
    });

    return data;
}
