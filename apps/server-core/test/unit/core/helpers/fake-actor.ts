/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { PermissionDeniedError } from '@privateaim/errors';
import type { FakeActorContext } from '@privateaim/server-test-kit';
import { FakePermissionEvaluator } from '@privateaim/server-test-kit';
import type { PermissionActorOptions } from './types.ts';

/**
 * Build an actor that holds exactly `permissions`. Like the real evaluator,
 * `preEvaluate`/`evaluate` pass only when EVERY requested name is held and the
 * `*OneOf` methods when ANY is. A refusal throws `PermissionDeniedError`, the
 * error a real denial surfaces as, so code that tells a denial apart from
 * other failures sees the real thing.
 */
export function createPermissionActor(options: PermissionActorOptions): FakeActorContext {
    const granted = new Set(options.permissions ?? []);

    return {
        permissionEvaluator: new FakePermissionEvaluator(({ ctx, method }) => {
            const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
            const permitted = method === 'preEvaluateOneOf' || method === 'evaluateOneOf' ?
                names.some((name) => granted.has(name)) :
                names.every((name) => granted.has(name));

            if (!permitted) {
                throw new PermissionDeniedError();
            }
        }),
        realm: options.realm,
        identity: options.identity ?? { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}
