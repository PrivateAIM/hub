/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithError } from '@privateaim/server-kit';
import { useAmqpClient } from '@privateaim/server-kit';
import { CoreEvent } from '../constants';
import type { CoreCommandContext } from '../type';
import { buildCoreAggregatorQueuePayload } from '../utils';

export async function writeFailedEvent(
    context: ComponentContextWithError<CoreCommandContext>,
) {
    const client = useAmqpClient();
    await client.publish(buildCoreAggregatorQueuePayload({
        event: CoreEvent.FAILED,
        command: context.command,
        data: context.data,
        error: context.error,
    }));

    return context.data;
}
