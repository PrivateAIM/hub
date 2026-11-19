/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { App, defineCoreHandler } from 'routup';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { mountSwaggerMiddleware } from '../../../src/middlewares/index.ts';

describe('mountSwaggerMiddleware', () => {
    let cwd: string;
    let app: App;

    beforeAll(() => {
        cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'hub-swagger-'));
        fs.writeFileSync(path.join(cwd, 'swagger.json'), JSON.stringify({
            openapi: '3.0.0',
            info: { title: 'hub', version: '0.0.0' },
            paths: {},
        }));

        app = new App();
        mountSwaggerMiddleware(app, { cwd, baseURL: 'http://hub.test/' });
        app.use(defineCoreHandler(() => ({ fallthrough: true })));
    });

    afterAll(() => {
        fs.rmSync(cwd, { recursive: true, force: true });
    });

    it('serves the ui shell with security headers', async () => {
        const response = await app.fetch(new Request('http://hub.test/docs/'));

        expect(response.status).toBe(200);
        expect(response.headers.get('x-content-type-options')).toBe('nosniff');
        expect(response.headers.get('x-frame-options')).toBe('DENY');
    });

    it('passes an unknown path below /docs on to the next handler', async () => {
        const response = await app.fetch(new Request('http://hub.test/docs/unknown.js'));

        await expect(response.json()).resolves.toEqual({ fallthrough: true });
    });
});
