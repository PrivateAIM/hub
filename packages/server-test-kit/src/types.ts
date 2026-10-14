/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { FakePermissionEvaluator } from '@authup/server-test-kit';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * An `ActorContext` whose evaluator is known to be the fake, so a spec reads
 * `actor.permissionEvaluator.preEvaluateCalls` without a cast.
 */
export type FakeActorContext = ActorContext & {
    permissionEvaluator: FakePermissionEvaluator;
};

/** A permission row as Authup's management API lists it. */
export type AuthupPermissionRow = {
    id: string,
    clientId?: string | null,
    realmId?: string | null,
};
