/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type AccountConsoleURLOptions = {
    /**
     * Bare path below the console root — no query string, no fragment.
     *
     * Defaults to `/`.
     */
    path?: string;

    /**
     * Realm of the current UI session, forwarded as the console's `realmId`
     * hint so an expired IdP session lands on that realm's sign-in rather
     * than on the console's realm chooser.
     *
     * Omitted from the url when empty — the store has no realm before the
     * session resolves.
     */
    realmId?: string | null;
};
