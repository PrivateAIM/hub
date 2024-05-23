/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useAmqpClient } from '@privateaim/server-kit';
import { BuilderEvent } from '@privateaim/server-analysis-manager-kit';
import type { BuilderCheckCommandContext, BuilderCheckPayload } from '@privateaim/server-analysis-manager-kit';
import { buildBuilderAggregatorQueuePayload } from '../utils';

export async function writeCheckedEvent(
    context: BuilderCheckCommandContext,
) : Promise<BuilderCheckPayload> {
    const client = useAmqpClient();
    await client.publish(buildBuilderAggregatorQueuePayload({
        event: BuilderEvent.CHECKED,
        command: context.command,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
