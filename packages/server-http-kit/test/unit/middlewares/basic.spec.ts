/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { readRequestBody } from '@routup/basic/body';
import { useRequestCookie } from '@routup/basic/cookie';
import { useRequestQuery } from '@routup/basic/query';
import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { mountBasicMiddleware, mountErrorMiddleware } from '../../../src/middlewares/index.ts';

function createApp() {
    const app = new App();

    mountBasicMiddleware(app);
    app.post('/', defineCoreHandler(async (event) => ({ body: await readRequestBody(event) ?? null })));
    app.get('/', defineCoreHandler((event) => ({
        cookie: useRequestCookie(event, 'access_token') ?? null,
        query: useRequestQuery(event),
    })));
    mountErrorMiddleware(app);

    return app;
}

describe('mountBasicMiddleware', () => {
    it('parses a json body', async () => {
        const response = await createApp().fetch(new Request('http://hub.test/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: 'node' }),
        }));

        await expect(response.json()).resolves.toEqual({ body: { name: 'node' } });
    });

    it('answers a json body over the limit 413', async () => {
        const response = await createApp().fetch(new Request('http://hub.test/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ value: 'x'.repeat(11 * 1024 * 1024) }),
        }));

        expect(response.status).toEqual(413);
    });

    it('does not parse a form body', async () => {
        const response = await createApp().fetch(new Request('http://hub.test/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: 'name=node',
        }));

        const payload = await response.json();

        expect(payload.body?.name).toBeUndefined();
    });

    it('still parses cookies and the query', async () => {
        const response = await createApp().fetch(new Request('http://hub.test/?limit=10', { headers: { cookie: 'access_token=abc' } }));

        await expect(response.json()).resolves.toEqual({ cookie: 'abc', query: { limit: '10' } });
    });
});
