/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    AnalysisCoreCommand,
    AnalysisCoreEvent,
    buildCoreEventQueueRouterPayload,
} from '@privateaim/server-core-worker-kit';
import type {
    AnalysisCoreDestroyPayload,
} from '@privateaim/server-core-worker-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { useCoreLogger } from '../utils';

export async function writeDestroyedEvent(
    data: AnalysisCoreDestroyPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildCoreEventQueueRouterPayload({
        event: AnalysisCoreEvent.DESTROYED,
        command: AnalysisCoreCommand.DESTROY,
        data,
    }));

    useCoreLogger().info({
        message: `Destroyed analysis ${data.id}`,
        command: AnalysisCoreCommand.DESTROY,
        analysis_id: data.id,
        [LogFlag.REF_ID]: data.id,
        event: AnalysisCoreEvent.DESTROYED,
    });

    return data;
}
