/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { install as authupInstall } from '@authup/client-web-kit';
import { createFakeClient as createFakeAuthupClient } from '@authup/core-http-kit/testing';
import { createFakeClient as createFakeCoreClient } from '@privateaim/core-http-kit/testing';
import type { FakeHandlerMap as CoreFakeHandlerMap } from '@privateaim/core-http-kit/testing';
import { createFakeClient as createFakeStorageClient } from '@privateaim/storage-kit/testing';
import type { FakeHandlerMap as StorageFakeHandlerMap } from '@privateaim/storage-kit/testing';
import { createFakeClient as createFakeTelemetryClient } from '@privateaim/telemetry-kit/testing';
import type { FakeHandlerMap as TelemetryFakeHandlerMap } from '@privateaim/telemetry-kit/testing';
import vuecs from '@vuecs/core';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import type { Component } from 'vue';
import { install } from '../../src/module';

const noop = () => undefined;

export type MountHandlers = {
    core?: CoreFakeHandlerMap,
    storage?: StorageFakeHandlerMap,
    telemetry?: TelemetryFakeHandlerMap
};

/**
 * Mount a client-vue component against transport-level fakes.
 *
 * Ordering is load-bearing:
 *
 * 1. `pinia` — authup's store factory needs it, and outside Nuxt there is no
 *    ambient injection context during `app.use()`.
 * 2. `@vuecs/core` — first-install-wins theme manager. An empty theme config
 *    leaves components structurally mountable but unstyled: fine for behavior
 *    assertions, misleading for snapshots.
 * 3. `@authup/client-web-kit` — MANDATORY and BEFORE client-vue, whose
 *    `setupBaseHTTPClient` calls `injectHTTPClientAuthenticationHook(app)` and
 *    whose `usePermissionCheck` sites call `injectStore()`. client-vue's
 *    install is not self-sufficient and throws without this.
 * 4. client-vue — with the three fakes passed explicitly.
 *
 * `isServer: true` is mandatory: it maps to the auth hook's `timer: !isServer`,
 * so without it a real refresh timer is armed in happy-dom and leaks across
 * specs. The cookie noops avoid `@vueuse/integrations`' `useCookies`.
 *
 * Prefer the explicit `client` option over pre-providing a fake: every
 * `install*()` early-returns on `isXHTTPClientUsable(app)` and authup's
 * `provide()` is first-wins, so an ordering mistake fails SILENTLY with the
 * real `new Client({ baseURL })` winning.
 */
export function mountClientVueComponent(
    component: Component,
    props: Record<string, any> = {},
    handlers: MountHandlers = {},
) {
    const pinia = createPinia();

    const coreClient = createFakeCoreClient({ handlers: handlers.core ?? {} });
    const storageClient = createFakeStorageClient({ handlers: handlers.storage ?? {} });
    const telemetryClient = createFakeTelemetryClient({ handlers: handlers.telemetry ?? {} });

    const authupOptions = {
        baseURL: 'http://authup.fake.test',
        httpClient: createFakeAuthupClient({
            handlers: {
                'POST /token': () => ({
                    access_token: 'xyz', 
                    token_type: 'Bearer', 
                    expires_in: 3600, 
                }), 
            },
        }),
        pinia,
        isServer: true,
        cookieGet: noop,
        cookieSet: noop,
        cookieUnset: noop,
    };

    const wrapper = mount(component, {
        props,
        global: {
            // `@vuecs/icon`'s VCIcon renders through `@iconify/vue`, which
            // resolves an unknown icon name by fetching it from the iconify
            // API. Left live, every icon-rendering spec makes a real network
            // request and happy-dom aborts it at teardown ("DOMException
            // [AbortError]"). VTU's `stubs` matches the component by NAME, so
            // it also intercepts the VCIcon that `@vuecs/button` imports
            // DIRECTLY — which a global `components` registration would not.
            stubs: { VCIcon: true },
            plugins: [
                pinia,
                [vuecs, {}],
                [{ install: authupInstall }, authupOptions],
                [{ install }, {
                    coreURL: 'http://core.fake.test',
                    storageURL: 'http://storage.fake.test',
                    telemetryURL: 'http://telemetry.fake.test',
                    coreHTTPClient: coreClient,
                    storageHTTPClient: storageClient,
                    telemetryHTTPClient: telemetryClient,
                    pinia,
                    // `realtime` omitted -> installSocketManager is skipped.
                }],
            ],
        },
    });

    return {
        wrapper, 
        coreClient, 
        storageClient, 
        telemetryClient, 
        pinia,
    };
}
