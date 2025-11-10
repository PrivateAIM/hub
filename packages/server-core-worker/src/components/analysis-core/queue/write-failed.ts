/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    AnalysisCoreEvent,
    buildCoreEventQueueRouterPayload,
} from '@privateaim/server-core-worker-kit';
import type { CoreCommandContext } from '@privateaim/server-core-worker-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useCoreLogger } from '../utils';

export async function writeFailedEvent(
    context: CoreCommandContext & {error?: Error},
) {
    context.data.error = context.error;

    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: AnalysisCoreEvent.FAILED,
        command: context.command,
        data: context.data,
    }));

    useCoreLogger().error({
        message: context.data.error || `${context.command} failed for analysis ${context.data.id}`,
        command: context.command,
        analysis_id: context.data.id,
        [LogFlag.REF_ID]: context.data.id,
        event: AnalysisCoreEvent.FAILED,
    });

    return context.data;
}
