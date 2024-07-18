/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesEvent,
} from '@privateaim/server-analysis-manager-kit';
import { buildMasterImagesEventQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import { useQueueRouter } from '@privateaim/server-kit';

export async function writeFailedEvent<T>(
    event: `${MasterImagesEvent.BUILD_FAILED}` |
        `${MasterImagesEvent.SYNCHRONIZATION_FAILED}` |
        `${MasterImagesEvent.PUSH_FAILED}`,
    data: T,
) : Promise<T> {
    const client = useQueueRouter();
    await client.publish(buildMasterImagesEventQueueRouterPayload({
        event,
        data,
    }));

    return data;
}
