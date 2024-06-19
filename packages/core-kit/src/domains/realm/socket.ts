/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';

export function buildSocketRealmNamespaceName(realmId: Realm['id']) {
    return `/resources#${realmId}`;
}

export function parseSocketRealmNamespaceName(name: string) : string | undefined {
    return name.startsWith('/resources#') ?
        name.substring('/resources#'.length) :
        name;
}
