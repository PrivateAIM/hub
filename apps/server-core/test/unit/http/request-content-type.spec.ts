/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { NodeCreatePayload } from '@privateaim/core-http-kit';
import { ConfigInjectionKey, createAuthupUserTokenCreator } from '@privateaim/server-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestApplication } from '../../app';

const createPayload = (): NodeCreatePayload => ({ name: faker.string.alpha({ length: 16, casing: 'lower' }) });

/**
 * A JSON-body route declares `@DConsumes('application/json')`: a body of any
 * other media type is refused with 415 before the handler runs, instead of
 * reaching it as an empty payload.
 */
describe('request content type of JSON-body routes', () => {
    const suite = createTestApplication();
    let baseURL: string;
    let token: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client.getBaseURL().replace(/\/+$/, '');

        const config = suite.container.resolve(ConfigInjectionKey);
        const { access_token: accessToken } = await createAuthupUserTokenCreator({
            baseURL: config.authupURL,
            name: 'admin',
            password: 'start123',
            realm: 'master',
        })();

        token = accessToken;
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const post = async (path: string, contentType: string, body: string) => fetch(`${baseURL}${path}`, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${token}`,
            'content-type': contentType,
        },
        body,
    });

    it('refuses a text/plain body with 415', async () => {
        const response = await post('/nodes', 'text/plain', JSON.stringify(createPayload()));

        expect(response.status).toEqual(415);
    });

    it('accepts a JSON body', async () => {
        const response = await post('/nodes', 'application/json; charset=utf-8', JSON.stringify(createPayload()));

        expect(response.status).toEqual(201);

        const { data } = await response.json();

        await suite.client.node.delete(data.id);
    });

    it('accepts a JSON body through the HTTP client', async () => {
        const { data } = await suite.client.node.create(createPayload());

        expect(data.id).toBeDefined();

        await suite.client.node.delete(data.id);
    });
});
