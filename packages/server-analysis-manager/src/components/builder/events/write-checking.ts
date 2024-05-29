/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import { BuilderEvent, buildBuilderEventQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import type { BuilderCheckCommandContext, BuilderCheckPayload } from '@privateaim/server-analysis-manager-kit';

export async function writeCheckingEvent(
    context: BuilderCheckCommandContext,
) : Promise<BuilderCheckPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.CHECKING,
        command: context.command,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
