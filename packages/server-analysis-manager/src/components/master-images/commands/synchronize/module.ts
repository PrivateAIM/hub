/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { scanDirectory } from 'docker-scan';
import type { MasterImagesSynchronizeCommandPayload } from '@privateaim/server-analysis-manager-kit';
import path from 'node:path';
import { WRITABLE_DIRECTORY_PATH } from '../../../../config';
import { writeBuildCommand } from '../../queue';
import { GitHubClient } from '../../../../core';

export async function executeMasterImagesSynchronizeCommand(
    payload: MasterImagesSynchronizeCommandPayload,
) {
    const outputDirectoryPath = path.join(WRITABLE_DIRECTORY_PATH, 'master-images');

    const gitHubClient = new GitHubClient();
    await gitHubClient.cloneRepository({
        destination: outputDirectoryPath,
        owner: payload.owner,
        repository: payload.repository,
        branch: payload.branch,
    });

    const dataDirectory = path.join(outputDirectoryPath, 'data');
    const { images, groups } = await scanDirectory(dataDirectory);

    await writeBuildCommand({
        directory: dataDirectory,
        images,
    });

    return {
        images,
        groups,
    };
}
