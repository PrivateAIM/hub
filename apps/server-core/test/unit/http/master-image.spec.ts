/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, 
    beforeAll, 
    describe, 
    expect, 
    it,
} from 'vitest';
import { createTestApplication } from '../../app';

describe('src/controllers/core/master-image', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should read collection', async () => {
        const { client } = suite;

        const { data } = await client.masterImage.getMany();
        expect(data.length).toBeGreaterThanOrEqual(0);
    });
});
