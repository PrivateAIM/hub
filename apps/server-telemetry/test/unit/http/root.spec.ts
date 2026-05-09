/*
 * Copyright (c) 2025.
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
import { createTestSuite } from '../../utils';

describe('root HTTP endpoint', () => {
    const suite = createTestSuite();
    let baseURL: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should return status with version and timestamp', async () => {
        const response = await fetch(`${baseURL}/`, { method: 'GET' });

        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.version).toBeDefined();
        expect(typeof body.version).toBe('string');
        expect(body.timestamp).toBeDefined();
        expect(typeof body.timestamp).toBe('number');
    });

    it('should update timestamp on subsequent calls', async () => {
        const response1 = await fetch(`${baseURL}/`, { method: 'GET' });
        const body1 = await response1.json();

        // Small delay to ensure timestamp difference
        await new Promise((resolve) => { setTimeout(resolve, 10); });

        const response2 = await fetch(`${baseURL}/`, { method: 'GET' });
        const body2 = await response2.json();

        expect(body2.timestamp).toBeGreaterThanOrEqual(body1.timestamp);
        expect(body2.version).toBe(body1.version);
    });
});
