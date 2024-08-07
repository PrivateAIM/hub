/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { scanDirectory } from 'docker-scan';
import path from 'node:path';
import { WRITABLE_DIRECTORY_PATH } from '../../src/config';
import { GitHubClient } from '../../src/core';

describe('git/clone', () => {
    it('should clone git repository', async () => {
        const destination = path.join(WRITABLE_DIRECTORY_PATH, 'git');

        const gitHubClient = new GitHubClient();
        await gitHubClient.cloneRepository({
            owner: 'PrivateAim',
            repository: 'master-images',
            branch: 'master',
            destination,
        });

        const { images, groups } = await scanDirectory(path.join(destination, 'data'));

        expect(images.length).toBeGreaterThan(0);
        expect(groups.length).toBeGreaterThan(0);
    });
});
