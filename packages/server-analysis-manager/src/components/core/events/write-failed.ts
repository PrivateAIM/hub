/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithError } from '@privateaim/server-kit';
import { useQueueRouter } from '@privateaim/server-kit';
import { CoreEvent, buildCoreEventQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import type { CoreCommandContext } from '@privateaim/server-analysis-manager-kit';

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

    return context.data;
}
