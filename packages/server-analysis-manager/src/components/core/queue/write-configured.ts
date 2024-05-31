/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import { CoreEvent, buildCoreEventQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import type { CoreConfigureCommandContext } from '@privateaim/server-analysis-manager-kit';

export async function writeConfiguredEvent(
    context: CoreConfigureCommandContext,
) {
    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: CoreEvent.CONFIGURED,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
