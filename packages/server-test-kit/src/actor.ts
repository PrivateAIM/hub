/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { PermissionDeniedError } from '@privateaim/errors';
import { FakePermissionEvaluator } from './fake-permission-evaluator.ts';
import type { FakeActorContext } from './types.ts';

function createDenyingEvaluator(): FakePermissionEvaluator {
    const evaluator = new FakePermissionEvaluator();
    evaluator.denyAll(new PermissionDeniedError());
    return evaluator;
}

export function createAllowAllActor(realmId?: string): FakeActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionEvaluator: new FakePermissionEvaluator(),
        realm: { id, name: REALM_MASTER_NAME },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createDenyAllActor(realmId?: string): FakeActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionEvaluator: createDenyingEvaluator(),
        realm: { id, name: 'test-realm' },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createMasterRealmActor(realmId?: string): FakeActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionEvaluator: new FakePermissionEvaluator(),
        realm: { id, name: REALM_MASTER_NAME },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}

export function createNonMasterRealmActor(realmId?: string): FakeActorContext {
    const id = realmId ?? randomUUID();
    return {
        permissionEvaluator: new FakePermissionEvaluator(),
        realm: { id, name: 'test-realm' },
        identity: { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}
