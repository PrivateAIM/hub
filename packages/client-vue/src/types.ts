/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICoreClient } from '@privateaim/core-http-kit';
import type { IStorageClient } from '@privateaim/storage-kit';
import type { ITelemetryClient } from '@privateaim/telemetry-kit';
import type { Pinia } from 'pinia';

/**
 * NOTE: this install is NOT self-sufficient. `@authup/client-web-kit`'s auth
 * hook and store must already be provided on the same app — `setupBaseHTTPClient`
 * calls `injectHTTPClientAuthenticationHook(app)`, and the `usePermissionCheck`
 * sites call `injectStore()`. Installing only client-vue throws.
 */
export type Options = {
    coreURL: string,
    storageURL: string,
    telemetryURL: string,

    components?: boolean | string[],

    translatorLocale?: string,

    /**
     * Pre-built HTTP clients. When given, the matching installer skips
     * `new Client({ baseURL })` and provides these instead — the seam a test
     * uses to inject a `FakeClient` from `@privateaim/<kit>/testing`.
     */
    coreHTTPClient?: ICoreClient,
    storageHTTPClient?: IStorageClient,
    telemetryHTTPClient?: ITelemetryClient,

    /**
     * Pinia instance backing authup's store, forwarded to the socket manager.
     * Required outside Nuxt, where `app.use()` provides no injection context.
     */
    pinia?: Pinia,

    /**
     * Install the realtime socket manager. Opt-in: it needs a live authup store
     * and opens a websocket, which no component test wants.
     */
    realtime?: boolean
};
