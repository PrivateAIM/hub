/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestURL, useRuntimeConfig } from '#imports';

/**
 * Build a link into the account console, the self-service surface served
 * by Authup's server-core on the IdP origin (Authup >= 1.0.0-beta.59).
 *
 * The UI origin rides along as `ref`, which the account console renders
 * as a back link after validating it against the trusted app origins
 * (`resolveAccountConsoleRef`). The UI origin is already required to be
 * trusted for the login callback, so this costs no extra deployment
 * configuration.
 *
 * `path` is a bare path: no query string, no fragment. The concatenation
 * below would otherwise emit a second `?`. It is deliberately NOT built
 * with `new URL(path, base)`, which would resolve against the origin and
 * so drop the sub-path when Authup is deployed behind a prefix-stripping
 * proxy (a publicUrl carrying a pathname).
 *
 * Returns `undefined` when neither `accountUrl` nor `authupUrl` is
 * configured. The callers drop the entry rather than emit a root-relative
 * `/account` — `<VCNavItems>` only treats an ABSOLUTE url as a plain
 * anchor, so a relative one would silently become an in-app route that
 * does not exist.
 */
export function useAccountConsoleURL(path = '/') : string | undefined {
    const runtimeConfig = useRuntimeConfig();

    const authupUrl = ((runtimeConfig.public.authupUrl as string | undefined) ?? '')
        .replace(/\/+$/, '');
    const baseUrl = ((runtimeConfig.public.accountUrl as string | undefined) || (authupUrl ? `${authupUrl}/account` : ''))
        .replace(/\/+$/, '');

    if (!baseUrl) {
        return undefined;
    }

    const normalized = path.startsWith('/') ? path : `/${path}`;
    const ref = encodeURIComponent(useRequestURL().origin);

    return `${baseUrl}${normalized}?ref=${ref}`;
}
