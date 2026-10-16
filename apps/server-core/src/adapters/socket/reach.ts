/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import { assertRecordReach, hasUnboundedReach } from '@privateaim/server-kit';
import type { SocketReachData } from './types.ts';

const PERMISSION_NAMES: string[] = Object.values(PermissionName);

/** `/resources` (global) or `/resources/<realmId>`. */
export const SOCKET_NAMESPACE_PATTERN = /^\/resources(?:\/([a-z0-9A-Z-_]+))?$/;

/** The realm id of a `/resources/<realmId>` namespace; `undefined` for the global one. */
export function resolveSocketNamespaceId(name: string): string | undefined {
    const matches = name.match(SOCKET_NAMESPACE_PATTERN);
    return matches ? matches[1] : undefined;
}

/**
 * Gate for connecting to a namespace. The actor's own realm namespace is open;
 * the global namespace carries every realm's events and a foreign realm's
 * namespace that realm's, so both need a grant (of any hub permission) reaching
 * every realm. Rooms check their own permission names on subscribe
 * ({@link assertSocketSubscribeReach}), so holding an unbounded grant for one
 * family does not open another's rooms.
 */
export async function assertSocketNamespaceReach(data: SocketReachData): Promise<void> {
    const {
        permissionEvaluator, 
        identity, 
        namespaceId, 
    } = data;
    if (!permissionEvaluator || !identity) {
        throw new PermissionDeniedError();
    }

    if (namespaceId && namespaceId === identity.realmId) {
        return;
    }

    if (!await hasUnboundedReach({ permissionEvaluator }, PERMISSION_NAMES)) {
        throw new PermissionDeniedError();
    }
}

/**
 * Gate for joining a room. A realm namespace (`/resources/<realmId>`) carries
 * that realm's events, so a grant of `names` must reach that realm; the global
 * namespace carries every realm's, so a grant must reach every realm.
 */
export async function assertSocketSubscribeReach(data: SocketReachData, names: string[]): Promise<void> {
    const { permissionEvaluator, namespaceId } = data;
    if (!permissionEvaluator) {
        throw new PermissionDeniedError();
    }

    if (namespaceId) {
        await assertRecordReach({ permissionEvaluator }, names, { realmId: namespaceId });
        return;
    }

    if (!await hasUnboundedReach({ permissionEvaluator }, names)) {
        throw new PermissionDeniedError();
    }
}
