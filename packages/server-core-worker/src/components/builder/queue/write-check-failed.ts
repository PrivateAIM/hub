/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import type { BuilderCheckPayload } from '@privateaim/server-core-worker-kit';
import { BuilderCommand, BuilderEvent, buildBuilderEventQueueRouterPayload } from '@privateaim/server-core-worker-kit';
import { useBuilderLogger } from '../utils';

export async function writeCheckFailedEvent(
    data: BuilderCheckPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.CHECK_FAILED,
        data,
    }));

    useBuilderLogger().error({
        message: `Check failed for analysis ${data.id}`,
        ...(data.error ? data.error : {}),
        command: BuilderCommand.CHECK,
        analysis_id: data.id,
        event: BuilderEvent.CHECK_FAILED,
    });
}
