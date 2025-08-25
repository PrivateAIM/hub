/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithError } from '@privateaim/server-kit';
import { useQueueRouter } from '@privateaim/server-kit';
import {
    CoreEvent,
    buildCoreEventQueueRouterPayload,
} from '@privateaim/server-core-worker-kit';
import type { CoreCommandContext } from '@privateaim/server-core-worker-kit';
import { useCoreLogger } from '../utils';

export async function writeFailedEvent(
    context: ComponentContextWithError<CoreCommandContext>,
) {
    context.data.error = context.error;

    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: CoreEvent.FAILED,
        command: context.command,
        data: context.data,
    }));

    useCoreLogger().error({
        message: `${context.command} failed for analysis ${context.data.id}`,
        ...(context.data.error ? context.data.error : {}),
        command: context.command,
        analysis_id: context.data.id,
        event: CoreEvent.FAILED,
    });

    return context.data;
}
