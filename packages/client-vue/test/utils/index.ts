/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { install as authupInstall } from '@authup/client-web-kit';
import type { HydrationStore } from '@authup/client-web-kit';
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
import type { App, Component, Plugin } from 'vue';
import { createSSRApp } from 'vue';
import { install } from '../../src/module';

const noop = () => undefined;

export type MountHandlers = {
    core?: CoreFakeHandlerMap,
    storage?: StorageFakeHandlerMap,
    telemetry?: TelemetryFakeHandlerMap
};

export type MountOptions = {
    /**
     * Install the realtime socket manager. Off by default, mirroring
     * client-vue's own `realtime` install option.
     */
    realtime?: boolean,
    /**
     * The SSR-to-client handoff bucket. Goes to AUTHUP's install (which owns
     * `provideHydrationStore`), not to client-vue's — hub adds no install
     * option of its own. Omitted by default, which is the "host without server
     * rendering" path every other spec exercises.
     */
    hydrationStore?: HydrationStore
};

/**
 * The plugin stack both entry points share, as `[plugin, options]` tuples so
 * VTU's `global.plugins` and a bare `app.use()` can consume the same array.
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
function createPluginStack(
    handlers: MountHandlers,
    options: MountOptions,
) {
    const pinia = createPinia();

    const coreClient = createFakeCoreClient({ handlers: handlers.core ?? {} });
    const storageClient = createFakeStorageClient({ handlers: handlers.storage ?? {} });
    const telemetryClient = createFakeTelemetryClient({ handlers: handlers.telemetry ?? {} });

    const plugins : [Plugin, Record<string, any>][] = [
        [pinia, {}],
        [vuecs, {}],
        [{ install: authupInstall }, {
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
            // authup's install owns `provideHydrationStore` — undefined here is
            // the no-store path, which is what makes the handoff opt-in.
            hydrationStore: options.hydrationStore,
        }],
        [{ install }, {
            coreURL: 'http://core.fake.test',
            storageURL: 'http://storage.fake.test',
            telemetryURL: 'http://telemetry.fake.test',
            coreHTTPClient: coreClient,
            storageHTTPClient: storageClient,
            telemetryHTTPClient: telemetryClient,
            pinia,
            // Off unless a spec opts in -> installSocketManager skipped.
            realtime: options.realtime,
        }],
    ];

    return {
        plugins,
        coreClient,
        storageClient,
        telemetryClient,
        pinia,
    };
}

/**
 * Mount a client-vue component against transport-level fakes.
 */
export function mountClientVueComponent(
    component: Component,
    props: Record<string, any> = {},
    handlers: MountHandlers = {},
    options: MountOptions = {},
) {
    const {
        plugins, 
        coreClient, 
        storageClient, 
        telemetryClient, 
        pinia,
    } = createPluginStack(handlers, options);

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
            plugins,
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

/**
 * Build the same app as `mountClientVueComponent`, but as an SSR/hydration app
 * the caller drives itself — `renderToString(app)` on the server side of the
 * boundary, `app.mount(el)` on the client side of it.
 *
 * There is no VTU here and therefore NO `stubs`, so keep the rendered tree
 * icon-free (pass an `item` slot rather than letting a list fall through to its
 * default item renderer): an unstubbed `VCIcon` resolves unknown names by
 * fetching them from the iconify API.
 */
export function createClientVueApp(
    component: Component,
    props: Record<string, any> = {},
    handlers: MountHandlers = {},
    options: MountOptions = {},
) {
    const {
        plugins, 
        coreClient, 
        storageClient, 
        telemetryClient, 
        pinia,
    } = createPluginStack(handlers, options);

    const app : App = createSSRApp(component, props);
    for (const [plugin, pluginOptions] of plugins) {
        app.use(plugin, pluginOptions);
    }

    return {
        app,
        coreClient,
        storageClient,
        telemetryClient,
        pinia,
    };
}
