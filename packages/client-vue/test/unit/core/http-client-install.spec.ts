/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { install as authupInstall } from '@authup/client-web-kit';
import { createFakeClient as createFakeAuthupClient } from '@authup/core-http-kit/testing';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';
import { install } from '../../../src';
import {
    injectCoreHTTPClient,
    injectStorageHTTPClient,
    injectTelemetryHTTPClient,
} from '../../../src/core';

function noop() {}

describe('install: httpTimeout', () => {
    it('applies the timeout to the clients built from the service URLs', () => {
        const app = createApp({});
        const pinia = createPinia();

        app.use(pinia);
        // client-vue's installers need authup's authentication hook first.
        app.use({ install: authupInstall }, {
            baseURL: 'http://authup.fake.test',
            httpClient: createFakeAuthupClient(),
            pinia,
            isServer: true,
            cookieGet: noop,
            cookieSet: noop,
            cookieUnset: noop,
        });
        app.use({ install }, {
            coreURL: 'http://core.fake.test',
            storageURL: 'http://storage.fake.test',
            telemetryURL: 'http://telemetry.fake.test',
            httpTimeout: 1234,
            pinia,
        });

        expect(injectCoreHTTPClient(app).defaults.timeout).toEqual(1234);
        expect(injectStorageHTTPClient(app).defaults.timeout).toEqual(1234);
        expect(injectTelemetryHTTPClient(app).defaults.timeout).toEqual(1234);
    });
});
