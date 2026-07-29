/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type BaseHTTPClientInstallOptions<C = unknown> = {
    baseURL?: string,
    /**
     * A pre-built client. When given it is used as-is instead of constructing
     * one from `baseURL` — the seam a test uses to inject a `FakeClient`.
     */
    client?: C
};
