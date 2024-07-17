/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImagesCommand, buildMasterImagesTaskQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';

export async function runMasterImagesSynchronizeCommand() : Promise<void> {
    if (!isQueueRouterUsable()) {
        useLogger().warn('The master-images command synchronize could not be executed.');
        return;
    }

    const message = buildMasterImagesTaskQueueRouterPayload({
        command: MasterImagesCommand.SYNCHRONIZE,
        data: {
            branch: 'master', // todo: extract from request
            url: 'https://github.com/PrivateAim/master-images/', // todo: extract from request
        },
    });

    const client = useQueueRouter();
    await client.publish(message);
}
