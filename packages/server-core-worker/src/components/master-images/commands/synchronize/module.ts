/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesSynchronizeCommandPayload,
} from '@privateaim/server-core-worker-kit';
import { MasterImagesEvent, useMasterImageQueueService } from '@privateaim/server-core-worker-kit';
import { MASTER_IMAGES_DIRECTORY_PATH } from '../../../../constants';
import { GitHubClient } from '../../../../core';
import { scanMasterImagesDirectory } from './helper';

export async function executeMasterImagesSynchronizeCommand(
    payload: MasterImagesSynchronizeCommandPayload,
) {
    const queue = useMasterImageQueueService();
    await queue.publishEvent({
        event: MasterImagesEvent.SYNCHRONIZING,
        data: {},
    });

    const gitHubClient = new GitHubClient();
    await gitHubClient.cloneRepository({
        destination: MASTER_IMAGES_DIRECTORY_PATH,
        owner: payload.owner,
        repository: payload.repository,
        branch: payload.branch,
    });

    const data = await scanMasterImagesDirectory();

    await queue.publishEvent({
        event: MasterImagesEvent.SYNCHRONIZED,
        data,
    });

    return data;
}
