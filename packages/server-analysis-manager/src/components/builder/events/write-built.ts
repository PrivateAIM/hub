/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand } from '@privateaim/server-kit';
import { useQueueRouter } from '@privateaim/server-kit';
import type { BuilderBuildCommandContext, BuilderBuildPayload, BuilderCommand } from '@privateaim/server-analysis-manager-kit';
import { BuilderEvent, buildBuilderEventQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';

export async function writeBuiltEvent(
    context: ComponentContextWithCommand<BuilderBuildCommandContext, `${BuilderCommand}`>,
) : Promise<BuilderBuildPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.BUILT,
        command: context.command,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
