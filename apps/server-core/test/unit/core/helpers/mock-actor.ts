/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { ForbiddenError } from '@ebec/http';
import { vi } from 'vitest';
import type { ActorContext, IPermissionChecker } from '../../../../src/core/entities/actor/types.ts';

export function createMockPermissionChecker(
    handler?: () => void,
): IPermissionChecker {
    const impl = handler ?? (() => { /* allow all */ });

    return {
        preCheck: vi.fn().mockImplementation(impl),
        check: vi.fn().mockImplementation(impl),
        preCheckOneOf: vi.fn().mockImplementation(impl),
        checkOneOf: vi.fn().mockImplementation(impl),
    };
}

export function createAllowAllActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: createMockPermissionChecker(),
        realm: { id, name: REALM_MASTER_NAME },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createDenyAllActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: createMockPermissionChecker(() => {
            throw new ForbiddenError();
        }),
        realm: { id, name: REALM_MASTER_NAME },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createMasterRealmActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: createMockPermissionChecker(),
        realm: { id, name: REALM_MASTER_NAME },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createNonMasterRealmActor(realmId?: string): ActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionChecker: createMockPermissionChecker(),
        realm: { id, name: 'test-realm' },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}
