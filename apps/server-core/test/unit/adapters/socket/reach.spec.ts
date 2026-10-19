/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionError } from '@authup/access';
import type { PermissionCompileContext, PermissionCompileResult } from '@authup/access';
import { PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import type { FakeActorContext } from '@privateaim/server-test-kit';
import { FakePermissionEvaluator, createScopedActor } from '@privateaim/server-test-kit';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
    assertSocketNamespaceReach,
    assertSocketSubscribeReach,
    resolveSocketNamespaceId,
} from '../../../../src/adapters/socket/reach.ts';
import type { SocketReachData } from '../../../../src/adapters/socket/types.ts';

const ANALYSIS = [PermissionName.ANALYSIS_UPDATE];

function toSocketData(actor: FakeActorContext, namespaceId?: string): SocketReachData {
    return {
        permissionEvaluator: actor.permissionEvaluator,
        identity: {
            id: actor.identity.id,
            type: 'user',
            realmId: actor.realm.id,
            realmName: actor.realm.name,
        },
        namespaceId,
    };
}

/** Unbounded (`any`) for the given names only; every other name compiles to deny. */
class PerNameEvaluator extends FakePermissionEvaluator {
    constructor(protected unbounded: string[]) {
        super();
    }

    override async compile(ctx: PermissionCompileContext): Promise<PermissionCompileResult> {
        const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
        return { verdict: names.some((name) => this.unbounded.includes(name)) ? 'allow' : 'deny' };
    }
}

describe('adapters/socket/reach', () => {
    it('reads the realm id of a realm namespace, none for the global one', () => {
        const realmId = randomUUID();
        expect(resolveSocketNamespaceId(`/resources/${realmId}`)).toBe(realmId);
        expect(resolveSocketNamespaceId('/resources')).toBeUndefined();
    });

    describe('namespace', () => {
        it('admits an own-scoped actor to its own realm namespace', async () => {
            const actor = createScopedActor({ realmScope: 'own' });
            await expect(assertSocketNamespaceReach(toSocketData(actor, actor.realm.id))).resolves.toBeUndefined();
        });

        it('refuses an own-scoped actor the global and a foreign realm namespace', async () => {
            const actor = createScopedActor({ realmScope: 'own' });
            await expect(assertSocketNamespaceReach(toSocketData(actor))).rejects.toThrow(PermissionDeniedError);
            await expect(assertSocketNamespaceReach(toSocketData(actor, randomUUID()))).rejects.toThrow(PermissionDeniedError);
        });

        it('admits an any-scoped actor to the global and a foreign realm namespace', async () => {
            const actor = createScopedActor({ realmScope: 'any' });
            await expect(assertSocketNamespaceReach(toSocketData(actor))).resolves.toBeUndefined();
            await expect(assertSocketNamespaceReach(toSocketData(actor, randomUUID()))).resolves.toBeUndefined();
        });
    });

    describe('subscribe', () => {
        it('lets an own-scoped actor join rooms in its own realm namespace only', async () => {
            const actor = createScopedActor({ realmScope: 'own' });
            await expect(assertSocketSubscribeReach(toSocketData(actor, actor.realm.id), ANALYSIS)).resolves.toBeUndefined();
            await expect(assertSocketSubscribeReach(toSocketData(actor, randomUUID()), ANALYSIS)).rejects.toThrow(PermissionError);
            await expect(assertSocketSubscribeReach(toSocketData(actor), ANALYSIS)).rejects.toThrow(PermissionDeniedError);
        });

        it('lets an any-scoped actor join rooms in every namespace', async () => {
            const actor = createScopedActor({ realmScope: 'any' });
            await expect(assertSocketSubscribeReach(toSocketData(actor), ANALYSIS)).resolves.toBeUndefined();
            await expect(assertSocketSubscribeReach(toSocketData(actor, randomUUID()), ANALYSIS)).resolves.toBeUndefined();
        });

        it('does not let an unbounded grant of one family open another family\'s global rooms', async () => {
            const actor = createScopedActor({ realmScope: 'own' });
            const data = {
                ...toSocketData(actor),
                permissionEvaluator: new PerNameEvaluator([PermissionName.NODE_READ]),
            };

            await expect(assertSocketNamespaceReach(data)).resolves.toBeUndefined();
            await expect(assertSocketSubscribeReach(data, [PermissionName.NODE_READ])).resolves.toBeUndefined();
            await expect(assertSocketSubscribeReach(data, ANALYSIS)).rejects.toThrow(PermissionDeniedError);
        });
    });
});
