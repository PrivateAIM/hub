/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup } from '@privateaim/core-kit';
import { MasterImageCommand } from '@privateaim/core-kit';
import { createTestSuite } from '../../utils';

describe('src/controllers/core/master-image', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let masterImage : MasterImage;
    let masterImageGroup : MasterImageGroup;

    it('sync with git repository', async () => {
        const client = suite.client();
        const response = await client.masterImage.runCommand(MasterImageCommand.SYNC);

        expect(response.groups).toBeDefined();
        expect(response.images).toBeDefined();
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.masterImage.getMany();
        expect(data.length).toBeGreaterThan(0);

        [masterImage] = data;
    });

    it('should read group collection', async () => {
        const client = suite.client();

        const { data } = await client.masterImageGroup.getMany();
        expect(data.length).toBeGreaterThan(0);

        [masterImageGroup] = data;
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.masterImage.delete(masterImage.id);
    });

    it('should delete group resource', async () => {
        const client = suite.client();

        await client.masterImageGroup.delete(masterImageGroup.id);
    });
});
