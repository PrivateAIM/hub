/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestURL, useRuntimeConfig } from '#imports';
import type { AccountConsoleURLOptions } from './types';

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
 * The session realm rides along as `realmId`. It only matters once the
 * IdP session is gone: the UI's own session outlives it (its token was
 * minted earlier and is held client-side), so the account icon still
 * renders while the console sees an unauthenticated visitor. The console
 * consumes the hint in exactly that state and kicks off the
 * authorization-code flow against that realm, instead of presenting a
 * realm chooser the visitor has no reason to answer — it is ignored
 * while a console session exists, and while an `error` param is present,
 * so a denial cannot loop.
 *
 * `path` is a bare path: no query string, no fragment. The concatenation
 * below would otherwise emit a second `?`. It is deliberately NOT built
 * with `new URL(path, base)`, which would resolve against the origin and
 * so drop the sub-path when Authup is deployed behind a prefix-stripping
 * proxy (a publicUrl carrying a pathname).
 *
 * A builder is returned rather than a string because the two halves are
 * known at different times: the runtime config and the request origin are
 * read here, in `setup()`, where the Nuxt context is guaranteed, while the
 * realm is only known once the session store has resolved — which happens
 * AFTER setup on the page load that follows the redirect back from the
 * IdP. Callers therefore wrap the builder in a `computed`.
 *
 * The builder returns `undefined` when neither `accountUrl` nor `authupUrl`
 * is configured. The callers drop the entry rather than emit a root-relative
 * `/account` — `<VCNavItems>` only treats an ABSOLUTE url as a plain
 * anchor, so a relative one would silently become an in-app route that
 * does not exist.
 */
export function useAccountConsoleURL() : (options?: AccountConsoleURLOptions) => string | undefined {
    const runtimeConfig = useRuntimeConfig();

    const authupUrl = ((runtimeConfig.public.authupUrl as string | undefined) ?? '')
        .replace(/\/+$/, '');
    const baseUrl = ((runtimeConfig.public.accountUrl as string | undefined) || (authupUrl ? `${authupUrl}/account` : ''))
        .replace(/\/+$/, '');

    const ref = encodeURIComponent(useRequestURL().origin);

    return (options = {}) => {
        if (!baseUrl) {
            return undefined;
        }

        const path = options.path ?? '/';
        const normalized = path.startsWith('/') ? path : `/${path}`;

        let query = `?ref=${ref}`;
        if (options.realmId) {
            query += `&realmId=${encodeURIComponent(options.realmId)}`;
        }

        return `${baseUrl}${normalized}${query}`;
    };
}
