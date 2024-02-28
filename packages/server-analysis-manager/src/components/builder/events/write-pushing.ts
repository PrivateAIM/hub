/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand } from '@privateaim/server-kit';
import { useAmqpClient } from '../../../core';
import type { BuilderCommand } from '../constants';
import { BuilderEvent } from '../constants';
import type { BuilderBuildCommandContext, BuilderBuildPayload } from '../type';
import { buildBuilderAggregatorQueuePayload } from '../utils';

export async function writePushingEvent(
    context: ComponentContextWithCommand<BuilderBuildCommandContext, `${BuilderCommand}`>,
) : Promise<BuilderBuildPayload> {
    const client = useAmqpClient();
    await client.publish(buildBuilderAggregatorQueuePayload({
        event: BuilderEvent.PUSHING,
        command: context.command,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
