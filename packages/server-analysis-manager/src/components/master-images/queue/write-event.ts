/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImagesEventContext } from '@privateaim/server-analysis-manager-kit';
import {
    buildMasterImagesEventQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import { useQueueRouter } from '@privateaim/server-kit';

export async function writeMasterImagesEvent(
    ctx: MasterImagesEventContext,
) : Promise<void> {
    const client = useQueueRouter();
    await client.publish(buildMasterImagesEventQueueRouterPayload(ctx));
}
