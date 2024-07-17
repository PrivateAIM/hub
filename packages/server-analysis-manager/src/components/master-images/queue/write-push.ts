/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import type {
    MasterImagesPushCommandPayload,
} from '@privateaim/server-analysis-manager-kit';
import {
    MasterImagesCommand,
    buildMasterImagesTaskQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';

export async function writePushCommand(
    data: MasterImagesPushCommandPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildMasterImagesTaskQueueRouterPayload({
        command: `${MasterImagesCommand.PUSH}`,
        data,
    }));

    return data;
}
