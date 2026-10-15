/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { PermissionCompileResult } from '@authup/access';
import { BuiltInPolicyType, realmScopeMatches } from '@authup/access';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { PermissionDeniedError } from '@privateaim/errors';
import { eq, or } from '@rapiq/core';
import { FakePermissionEvaluator } from './fake-permission-evaluator.ts';
import type { FakeActorContext, ScopedActorOptions } from './types.ts';

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

/**
 * An actor whose every grant carries `realmScope`, enforced the way authup
 * enforces it: an evaluation whose data names a `realmMatch` passes only when
 * `realmScopeMatches` does, and `compile()` returns the verdict authup lowers
 * the scope to. Evaluations without `realmMatch` (capability pre-gates) pass.
 */
export function createScopedActor(options: ScopedActorOptions): FakeActorContext {
    const id = options.realmId ?? randomUUID();

    const permissionEvaluator = new FakePermissionEvaluator(({ ctx }) => {
        if (!ctx.data || !ctx.data.has(BuiltInPolicyType.REALM_MATCH)) {
            return;
        }

        const resourceRealmId = ctx.data.get<string | null>(BuiltInPolicyType.REALM_MATCH);
        if (!realmScopeMatches(options.realmScope, resourceRealmId, id)) {
            throw new PermissionDeniedError();
        }
    });
    permissionEvaluator.setCompileResult(compileRealmScope(options.realmScope, id));

    return {
        permissionEvaluator,
        realm: { id, name: 'test-realm' },
        identity: options.identity ?? {
            id: randomUUID(), 
            type: 'user', 
            realmId: id, 
        },
        metadata: {},
    };
}

function compileRealmScope(realmScope: ScopedActorOptions['realmScope'], realmId: string): PermissionCompileResult {
    switch (realmScope) {
        case 'any':
            return { verdict: 'allow' };
        case 'own':
            return { verdict: 'conditional', condition: eq('realmId', realmId) };
        case 'ownOrNull':
            return { verdict: 'conditional', condition: or(eq('realmId', realmId), eq('realmId', null)) };
        default:
            return { verdict: 'deny' };
    }
}
