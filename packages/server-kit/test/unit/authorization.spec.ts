/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { PermissionError } from '@authup/access';
import { FakePermissionEvaluator } from '@authup/server-test-kit';
import { PermissionDeniedError } from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
import type { ActorContext } from '../../src/index.ts';
import { hasUnboundedReach, holdsPermission, reachesRecord } from '../../src/index.ts';

function actorThrowing(error?: Error): ActorContext & { permissionEvaluator: FakePermissionEvaluator } {
    const permissionEvaluator = new FakePermissionEvaluator(() => {
        if (error) throw error;
    });

    return {
        permissionEvaluator,
        realm: { id: randomUUID(), name: 'test-realm' },
        identity: { id: randomUUID(), type: 'user' },
    };
}

describe('core/authorization', () => {
    describe.each([
        ['holdsPermission', (actor: ActorContext) => holdsPermission(actor, 'foo')],
        ['reachesRecord', (actor: ActorContext) => reachesRecord(actor, 'foo', { realmId: null })],
    ])('%s', (_label, check) => {
        it('should answer true when the permission is held', async () => {
            await expect(check(actorThrowing())).resolves.toBe(true);
        });

        it('should answer false on a hub denial', async () => {
            await expect(check(actorThrowing(new PermissionDeniedError()))).resolves.toBe(false);
        });

        it('should answer false on an authup denial', async () => {
            await expect(check(actorThrowing(PermissionError.evaluationFailed('foo')))).resolves.toBe(false);
        });

        // An outage of the authorization path must not read as "not authorized".
        it('should propagate any error that is not a denial', async () => {
            const error = new Error('catalog unreachable');
            await expect(check(actorThrowing(error))).rejects.toBe(error);
        });
    });

    it('should pass the realm as realmMatch, also when the record has none', async () => {
        const actor = actorThrowing();
        await reachesRecord(actor, 'foo', { realmId: undefined });

        expect(actor.permissionEvaluator.evaluateCalls[0].data?.has('realmMatch')).toBe(true);
        expect(actor.permissionEvaluator.evaluateCalls[0].data?.get('realmMatch')).toBeNull();
    });

    it('should count only an `allow` verdict as unbounded reach', async () => {
        const actor = actorThrowing();
        await expect(hasUnboundedReach(actor, 'foo')).resolves.toBe(false);

        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });
        await expect(hasUnboundedReach(actor, 'foo')).resolves.toBe(true);
    });
});
