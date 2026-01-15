/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import { createTestSuite } from '../../utils';

describe('src/controllers/core/master-image', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.masterImage.getMany();
        expect(data.length).toBeGreaterThanOrEqual(0);
    });
});
