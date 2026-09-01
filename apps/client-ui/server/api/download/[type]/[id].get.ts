/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { resolveDownloadTarget } from '../../../utils/download-target.ts';

/**
 * Same-origin download proxy for the storage service.
 *
 * A file download is a top-level navigation (`window.open`), so it cannot
 * carry an Authorization header and server-storage falls back to the
 * `access_token` cookie. That cookie is host-only — naming a Domain wide
 * enough to reach `storage.<env>` also reaches authup's own origin, where the
 * console writes a cookie of the SAME name, and the two writers collide (the
 * flame-hub chart refuses that combination outright).
 *
 * Pointing the download at this route instead keeps it on the UI's own
 * origin, so the host-only cookie IS sent. `proxyRequest` forwards it
 * verbatim to the in-cluster storage service, which authorizes the request
 * exactly as it always did — the proxy itself handles no tokens.
 *
 * ponytail: the session cookie is still ambient authority, just no longer
 * shared across subdomains. Scoped, short-lived download tokens are the
 * target state — see `.agents/plans/020-browser-download-authorization.md`.
 */
export default defineEventHandler((event) => {
    const target = resolveDownloadTarget(
        getRouterParam(event, 'type'),
        getRouterParam(event, 'id'),
    );

    if (!target) {
        throw createError({ statusCode: 404, statusMessage: 'Not Found' });
    }

    const { storageUrl } = useRuntimeConfig(event);

    // Streams chunk-by-chunk and preserves Content-Disposition, so the browser
    // downloads through its own download manager instead of the tab buffering
    // the whole file (a bucket download is a tar packed on the fly).
    return proxyRequest(event, new URL(target, storageUrl).href);
});
