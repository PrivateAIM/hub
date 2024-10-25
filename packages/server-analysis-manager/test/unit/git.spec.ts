/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { scanDirectory } from 'docker-scan';
import { MASTER_IMAGES_DATA_DIRECTORY_PATH, MASTER_IMAGES_DIRECTORY_PATH } from '../../src';
import { GitHubClient } from '../../src/core';

describe('git/clone', () => {
    it('should clone git repository', async () => {
        const gitHubClient = new GitHubClient();
        await gitHubClient.cloneRepository({
            owner: 'PrivateAim',
            repository: 'master-images',
            branch: 'master',
            destination: MASTER_IMAGES_DIRECTORY_PATH,
        });

        const { images, groups } = await scanDirectory(MASTER_IMAGES_DATA_DIRECTORY_PATH);

        expect(images.length).toBeGreaterThan(0);
        expect(groups.length).toBeGreaterThan(0);
    });
});
