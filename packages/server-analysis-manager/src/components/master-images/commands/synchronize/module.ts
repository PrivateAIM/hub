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
import { cloneGitRepository } from '../../../../core';

export async function executeMasterImagesSynchronizeCommand(
    payload: MasterImagesSynchronizeCommandPayload,
) {
    const outputDirectoryPath = path.join(WRITABLE_DIRECTORY_PATH, 'master-images');

    await cloneGitRepository({
        destination: outputDirectoryPath,
        branch: payload.branch,
        url: payload.url,
    });

    const { images, groups } = await scanDirectory(path.join(outputDirectoryPath, 'data'));

    await writeBuildCommand({
        directory: outputDirectoryPath,
        images,
    });

    return {
        images,
        groups,
    };
}
