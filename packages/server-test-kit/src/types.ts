/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { FakeHandler, FakeHandlerMap, FakeRequest } from '@privateaim/core-http-kit/testing';

import type { RealmScope } from '@authup/access';
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

export type ScopedActorOptions = {
    /** The actor's realm; random when omitted. */
    realmId?: string;
    /** The `realm_scope` every grant of the actor carries. */
    realmScope: `${RealmScope}`;
    /** Defaults to a user of `realmId`. */
    identity?: ActorContext['identity'];
};

export type ColumnNamingViolation = {
    table: string,
    property: string,
    column: string,
    reason: string,
};

export type FakeAuthupRequest = FakeRequest;

export type FakeAuthupHandler = FakeHandler;

export type FakeAuthupHandlerMap = FakeHandlerMap;

export type FakeAuthupClientOptions = {
    baseURL?: string,
    handlers?: FakeAuthupHandlerMap,
    fallback?: FakeAuthupHandler
};

export type QueryIndexInvariantDescription = {
    indexes?: string[][] | null,
    filters?: { allowed?: readonly string[] | null },
    sorts?: { allowed?: readonly string[] | null },
};
