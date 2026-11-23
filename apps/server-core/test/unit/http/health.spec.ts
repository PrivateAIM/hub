/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createHealthShutdownHook } from '@privateaim/server-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { HTTPInjectionKey } from '../../../src/app/modules/http/index.ts';
import { createTestApplication } from '../../app';

async function failing(response: Response): Promise<string[]> {
    const body = await response.json();

    return body.checks
        .filter((check: { ok: boolean }) => !check.ok)
        .map((check: { name: string }) => check.name);
}

describe('health endpoints', () => {
    const suite = createTestApplication();
    let baseURL: string;

    beforeAll(async () => {
        await suite.setup();

        const { url } = suite.container.resolve(HTTPInjectionKey.Server);

        baseURL = url.replace('0.0.0.0', '127.0.0.1').replace(/\/+$/, '');
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('answers /livez and /readyz anonymously, even with an invalid token', async () => {
        for (const path of ['/livez', '/readyz']) {
            const response = await fetch(`${baseURL}${path}`, { headers: { authorization: 'Bearer invalid' } });

            expect(response.status).toBe(200);
            expect(response.headers.get('cache-control')).toBe('no-store');
            expect((await response.json()).healthy).toBe(true);
        }
    });

    it('answers HEAD', async () => {
        const response = await fetch(`${baseURL}/readyz`, { method: 'HEAD' });

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('');
    });

    it('keeps answering the status document on /', async () => {
        const response = await fetch(`${baseURL}/`);

        expect(response.status).toBe(200);
        expect(typeof (await response.json()).version).toBe('string');
    });

    it('turns unready, not dead, when the database stops answering', async () => {
        await suite.dataSource.destroy();

        // A database result is reused for one second.
        await new Promise((resolve) => {
            setTimeout(resolve, 1_100);
        });

        const readiness = await fetch(`${baseURL}/readyz`);

        expect(readiness.status).toBe(503);
        expect(await failing(readiness)).toEqual(['database']);

        expect((await fetch(`${baseURL}/livez`)).status).toBe(200);
    });

    it('turns unready on the stop signal while /livez still answers', async () => {
        expect(createHealthShutdownHook(suite.container)()).toBe(0);

        const readiness = await fetch(`${baseURL}/readyz`);

        expect(readiness.status).toBe(503);
        expect(await failing(readiness)).toContain('shutdown');

        expect((await fetch(`${baseURL}/livez`)).status).toBe(200);
    });
});
