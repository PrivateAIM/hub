/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { scanMasterImagesDirectory } from '../../src/components/master-images/commands';
import { GitHubClient } from '../../src/core';
import { MASTER_IMAGES_DIRECTORY_PATH } from '../../src/constants';

describe('components > master-images', () => {
    it('should clone master images to directory', async () => {
        const gitHubClient = new GitHubClient();
        await gitHubClient.cloneRepository({
            owner: 'PrivateAim',
            repository: 'master-images',
            branch: 'develop',
            destination: MASTER_IMAGES_DIRECTORY_PATH,
        });
    });

    it('should sync master images from directory', async () => {
        const { images, groups } = await scanMasterImagesDirectory();

        expect(images.length).toBeGreaterThan(0);
        expect(groups.length).toBeGreaterThan(0);
    });
});
