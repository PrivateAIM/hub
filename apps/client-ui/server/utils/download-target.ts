/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

// The two storage endpoints reachable through the download proxy. The map
// doubles as the allow-list, so the proxy can never be aimed at an arbitrary
// storage path.
const TARGETS: Record<string, (id: string) => string> = {
    'bucket': (id) => `buckets/${id}/stream`,
    'bucket-file': (id) => `bucket-files/${id}/stream`,
};

/**
 * Ids are VALIDATED, not escaped: `encodeURIComponent` leaves `..` intact and
 * `new URL()` would then resolve it away, walking the proxy target up out of
 * the endpoint it was pinned to.
 */
export function resolveDownloadTarget(type?: string, id?: string): string | undefined {
    const target = type ? TARGETS[type] : undefined;

    if (!target || !id || !/^[\w-]+$/.test(id)) {
        return undefined;
    }

    return target(id);
}
