/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand, ComponentContextWithError } from '@privateaim/server-kit';
import { useQueueRouter } from '@privateaim/server-kit';
import type { BuilderCommand, BuilderCommandContext } from '@privateaim/server-analysis-manager-kit';
import { BuilderEvent, buildBuilderEventQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';

export async function writeFailedEvent(
    context: ComponentContextWithCommand<
    ComponentContextWithError<BuilderCommandContext>,
        `${BuilderCommand}`
    >,
) {
    context.data.error = context.error;

    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.FAILED,
        command: context.command,
        data: context.data,
    }));
}
