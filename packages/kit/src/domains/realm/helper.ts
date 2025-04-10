/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { isPropertySet } from '../../utils';

/**
 * Check if a realm resource is writable.
 *
 * @param realm
 * @param resourceRealmId
 */
export function isRealmResourceWritable(realm: Partial<Realm>, resourceRealmId: string | string[]) {
    if (Array.isArray(resourceRealmId)) {
        for (let i = 0; i < resourceRealmId.length; i++) {
            if (isRealmResourceWritable(realm, resourceRealmId[i])) {
                return true;
            }
        }
        return false;
    }

    if (!realm) {
        return false;
    }

    if (
        isPropertySet(realm, 'name') &&
        realm.name === REALM_MASTER_NAME
    ) {
        return true;
    }

    return realm?.id === resourceRealmId;
}
/**
 * Check if realm resource is readable.
 *
 * @param realm
 * @param resourceRealmId
 */

export function isRealmResourceReadable(realm: Partial<Realm>, resourceRealmId: string | string[]) {
    if (Array.isArray(resourceRealmId)) {
        if (resourceRealmId.length === 0) {
            return true;
        }
        for (let i = 0; i < resourceRealmId.length; i++) {
            if (isRealmResourceReadable(realm, resourceRealmId[i])) {
                return true;
            }
        }
        return false;
    }

    if (typeof realm === 'undefined') {
        return false;
    }

    if (
        isPropertySet(realm, 'name') &&
        realm.name === REALM_MASTER_NAME
    ) {
        return true;
    }

    return !resourceRealmId || realm?.id === resourceRealmId;
}
