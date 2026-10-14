/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { PermissionError } from '@authup/access';
import { PermissionDeniedError } from '@privateaim/errors';
import type { FakeActorContext } from '@privateaim/server-test-kit';
import { FakePermissionEvaluator } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { holdsPermission, isPermissionDenial } from '../../../../src/core/utils/index.ts';

function actorThrowing(error?: Error): FakeActorContext {
    return {
        permissionEvaluator: new FakePermissionEvaluator(() => {
            if (error) throw error;
        }),
        realm: { id: randomUUID(), name: 'test-realm' },
        identity: { id: randomUUID(), type: 'user' },
    };
}

describe('core/utils/permission', () => {
    it.each([
        ['hub PermissionDeniedError', new PermissionDeniedError()],
        ['authup PermissionError.denied', PermissionError.denied('foo')],
        ['authup PermissionError.deniedAll', PermissionError.deniedAll(['foo'])],
        ['authup PermissionError.evaluationFailed', PermissionError.evaluationFailed('foo')],
    ])('should classify %s as a denial', (_label, error) => {
        expect(isPermissionDenial(error)).toBe(true);
    });

    it('should not classify an arbitrary error as a denial', () => {
        expect(isPermissionDenial(new Error('boom'))).toBe(false);
    });

    it('should answer true when the permission is held', async () => {
        await expect(holdsPermission(actorThrowing(), 'foo')).resolves.toBe(true);
    });

    it('should answer false on a hub denial', async () => {
        await expect(holdsPermission(actorThrowing(new PermissionDeniedError()), 'foo')).resolves.toBe(false);
    });

    it('should answer false on an authup denial', async () => {
        await expect(holdsPermission(actorThrowing(PermissionError.evaluationFailed('foo')), 'foo')).resolves.toBe(false);
    });

    it('should propagate any error that is not a denial', async () => {
        const error = new Error('catalog unreachable');
        await expect(holdsPermission(actorThrowing(error), 'foo')).rejects.toBe(error);
    });
});
