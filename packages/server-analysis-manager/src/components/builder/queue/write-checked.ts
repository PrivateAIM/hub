/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    BuilderCommand,
    BuilderEvent,
    buildBuilderEventQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import type { BuilderCheckPayload } from '@privateaim/server-analysis-manager-kit';
import { useBuilderLogger } from '../utils';

export async function writeCheckedEvent(
    data: BuilderCheckPayload,
) : Promise<BuilderCheckPayload> {
    const client = useQueueRouter();
    await client.publish(buildBuilderEventQueueRouterPayload({
        event: BuilderEvent.CHECKED,
        data, //  { id: 'xxx' }
    }));

    useBuilderLogger().info({
        message: `Checked analysis ${data.id}`,
        command: BuilderCommand.CHECK,
        analysis_id: data.id,
        event: BuilderEvent.CHECKED,
    });

    return data;
}
