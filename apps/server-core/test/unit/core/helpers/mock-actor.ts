/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { ForbiddenError } from '@ebec/http';
import type { ActorContext } from '@privateaim/server-kit';
import { FakePermissionChecker } from './fake-permission-checker.ts';

export function createAllowAllActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: new FakePermissionChecker(),
        realm: { id, name: REALM_MASTER_NAME },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createDenyAllActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: new FakePermissionChecker(() => {
            throw new ForbiddenError();
        }),
        realm: { id, name: 'test-realm' },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createMasterRealmActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: new FakePermissionChecker(),
        realm: { id, name: REALM_MASTER_NAME },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createNonMasterRealmActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: new FakePermissionChecker(),
        realm: { id, name: 'test-realm' },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}
