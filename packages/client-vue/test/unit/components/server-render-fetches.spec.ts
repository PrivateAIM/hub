// @vitest-environment node

/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { isServerRuntime } from '@authup/client-web-kit';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import FEvents from '../../../src/components/event/FEvents.vue';
import FLogs from '../../../src/components/log/FLogs.vue';
import FMasterImageStatusSummary from '../../../src/components/master-image/FMasterImageStatusSummary.vue';
import { createClientVueApp } from '../../utils';

const flush = () => new Promise((resolve) => {
    setTimeout(resolve, 0);
});

/**
 * These components fetch in setup without the server render awaiting it, so a
 * server-side result never reached the HTML. Fetching anyway let a 401 trigger
 * a session refresh after the response was sent: the rotated refresh token
 * never reached the browser and its next refresh revoked the session
 * (authup/authup#3924). On the server they must not fetch at all.
 */
describe('un-awaited fetches during a server render', () => {
    const empty = { data: [], meta: { total: 0 } };

    it.each([
        ['FEvents', FEvents, { query: { filters: { refType: 'masterImage' } } }],
        ['FLogs', FLogs, { query: { filters: { labels: { refType: 'masterImage' } } } }],
        ['FMasterImageStatusSummary', FMasterImageStatusSummary, {}],
    ])('%s should send no request', async (_name, component, props) => {
        expect(isServerRuntime()).toBe(true);

        const host = defineComponent({
            setup() {
                return () => h(component, props, { body: () => h('div') });
            },
        });

        const {
            app, 
            coreClient, 
            telemetryClient, 
        } = createClientVueApp(host, {}, {
            core: { 'GET /master-images': () => empty },
            telemetry: {
                'GET /events': () => empty,
                'GET /logs': () => empty,
            },
        });

        await renderToString(app);
        await flush();

        expect(coreClient.requests).toHaveLength(0);
        expect(telemetryClient.requests).toHaveLength(0);
    });
});
