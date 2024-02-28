/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useAmqpClient } from '../../../core';
import { CoreEvent } from '../constants';
import type { CoreDestroyCommandContext } from '../type';
import { buildCoreAggregatorQueuePayload } from '../utils';

export async function writeDestroyedEvent(
    context: CoreDestroyCommandContext,
) {
    const client = useAmqpClient();
    await client.publish(buildCoreAggregatorQueuePayload({
        event: CoreEvent.DESTROYED,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
