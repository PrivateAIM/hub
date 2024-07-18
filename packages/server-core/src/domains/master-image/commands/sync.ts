/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImagesCommand, buildMasterImagesTaskQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import { useEnv } from '../../../config';

export async function runMasterImagesSynchronizeCommand() : Promise<void> {
    if (!isQueueRouterUsable()) {
        useLogger().warn('The master-images command synchronize could not be executed.');
        return;
    }

    const message = buildMasterImagesTaskQueueRouterPayload({
        command: MasterImagesCommand.SYNCHRONIZE,
        data: {
            branch: useEnv('masterImagesBranch'),
            url: useEnv('masterImagesURL'),
        },
    });

    const client = useQueueRouter();
    await client.publish(message);
}
