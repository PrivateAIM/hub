/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

// The two storage endpoints reachable through the download proxy. The map
// doubles as the allow-list, so the proxy can never be aimed at an arbitrary
// storage path. A Map, deliberately, not a plain object: `type` is an
// unvalidated route param, and a plain object's bracket lookup resolves keys
// like `constructor`/`__proto__` through the prototype chain instead of
// missing — `Map#get` never does.
const TARGETS = new Map<string, (id: string) => string>([
    ['bucket', (id) => `buckets/${id}/stream`],
    ['bucket-file', (id) => `bucket-files/${id}/stream`],
]);

/**
 * Ids are VALIDATED, not escaped: `encodeURIComponent` leaves `..` intact and
 * `new URL()` would then resolve it away, walking the proxy target up out of
 * the endpoint it was pinned to.
 */
export function resolveDownloadTarget(type?: string, id?: string): string | undefined {
    if (!id || !/^[\w-]+$/.test(id)) {
        return undefined;
    }

    const target = type ? TARGETS.get(type) : undefined;
    if (!target) {
        return undefined;
    }

    return target(id);
}

/**
 * Resolves the upstream URL for a download target against the storage base
 * URL, appending rather than replacing.
 *
 * `new URL(relative, base)` follows WHATWG relative resolution: a base with
 * no trailing slash has its LAST path segment replaced, not appended to
 * (`new URL('x', 'http://h/storage')` -> 'http://h/x', dropping '/storage').
 * A path-prefixed storage URL — exactly what the documented reverse-proxy
 * deployment uses — would silently lose that prefix unless the base ends in
 * '/', so it is normalized here rather than left to deployment convention.
 */
export function resolveDownloadUrl(target: string, storageUrl: string): string {
    const base = storageUrl.endsWith('/') ? storageUrl : `${storageUrl}/`;

    return new URL(target, base).href;
}
