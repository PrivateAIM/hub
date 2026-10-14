/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { FakePermissionChecker } from '@privateaim/server-test-kit';
import type { PermissionActorOptions } from './types.ts';

/**
 * Build an actor that holds exactly `permissions`. A check passes only when
 * every requested name is held (all-of, the `preCheck` semantics); anything
 * else throws `PermissionDeniedError`, the error a real denial surfaces as,
 * so code that tells a denial apart from other failures sees the real thing.
 */
export function createPermissionActor(options: PermissionActorOptions): ActorContext {
    const granted = new Set(options.permissions ?? []);

    return {
        permissionChecker: new FakePermissionChecker((ctx) => {
            const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
            if (names.some((name) => !granted.has(name))) {
                throw new PermissionDeniedError();
            }
        }),
        realm: options.realm,
        identity: options.identity ?? { id: randomUUID(), type: 'user' },
        metadata: {},
    };
}
