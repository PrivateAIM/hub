/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createTestSuite,
} from '../../utils';

describe('src/controllers/event', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    it('should generate events', async () => {
        const client = suite.client();

        const project = await client.project.create({
            name: 'foo-bar-baz',
        });

        project.name = 'baz-bar-foo';

        await client.project.update(project.id, project);
        await client.project.delete(project.id);
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.event.getMany();
        expect(data.length).toBeGreaterThanOrEqual(3);
    });
});
