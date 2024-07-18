/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    MasterImagesEvent,
    buildMasterImagesEventQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';

export async function writeSynchronizingEvent<T>(
    data: T,
) : Promise<T> {
    const client = useQueueRouter();
    await client.publish(buildMasterImagesEventQueueRouterPayload({
        event: MasterImagesEvent.SYNCHRONIZING,
        data,
    }));

    return data;
}
