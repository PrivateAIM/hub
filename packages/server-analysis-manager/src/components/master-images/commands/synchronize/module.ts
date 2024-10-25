/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { scanDirectory } from 'docker-scan';
import type { MasterImagesSynchronizeCommandPayload } from '@privateaim/server-analysis-manager-kit';
import { MasterImagesEvent, useMasterImageQueueService } from '@privateaim/server-analysis-manager-kit';
import { MASTER_IMAGES_DATA_DIRECTORY_PATH, MASTER_IMAGES_DIRECTORY_PATH } from '../../constants';
import { GitHubClient } from '../../../../core';

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

    const {
        images,
        groups,
    } = await scanDirectory(MASTER_IMAGES_DATA_DIRECTORY_PATH);

    await queue.publishEvent({
        event: MasterImagesEvent.SYNCHRONIZED,
        data: {
            images,
            groups,
        },
    });

    return {
        images,
        groups,
    };
}
