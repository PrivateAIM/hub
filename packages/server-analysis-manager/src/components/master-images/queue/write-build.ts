/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useQueueRouter } from '@privateaim/server-kit';
import {
    MasterImagesCommand,
    buildMasterImagesTaskQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import type {
    MasterImagesBuildCommandPayload,
} from '@privateaim/server-analysis-manager-kit';

export async function writeBuildCommand(
    data: MasterImagesBuildCommandPayload,
) {
    const client = useQueueRouter();
    await client.publish(buildMasterImagesTaskQueueRouterPayload({
        command: MasterImagesCommand.BUILD,
        data,
    }));

    return data;
}
