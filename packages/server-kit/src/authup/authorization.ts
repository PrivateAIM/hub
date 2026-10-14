/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationEvaluatorInput, IPermissionEvaluator } from '@authup/access';
import { createAuthorizationEvaluator } from '@authup/access';
import type { IClient } from '@authup/core-http-kit';
import { ScopeName } from '@authup/core-kit';
import { unwrapOAuth2Scope } from '@authup/specs';
import type { AuthupPolicySubject, AuthupTokenSubjectData } from './types.ts';

/**
 * What a policy may see for a token: ALWAYS its identity, and its grants only
 * when the token's scopes include `global`. Built straight from the token's
 * introspection and shared by the HTTP and socket middlewares, so hub spells
 * both the identity mapping and the gate once.
 *
 * Scope restricts what a caller can do, never who it is. A token without
 * `global` gets its identity placed with an EMPTY grant set, so:
 *
 * - the permission-binding policy (authup attaches it to every permission by
 *   default) finds nothing granted and denies — a permission DENIAL (403),
 *   not a missing-data error;
 * - identity-reading policies (`identity`, realm match, …) still evaluate
 *   against the real caller instead of against nobody.
 *
 * Authup applies the same rule since authup#3723 (`useRequestPolicyGrants`).
 */
export function resolveAuthupPolicySubject(data: AuthupTokenSubjectData): AuthupPolicySubject {
    const scopes = unwrapOAuth2Scope(data.scope || []);

    return {
        identity: {
            id: data.sub,
            type: data.sub_kind,
            realmId: data.realm_id,
            realmName: data.realm_name,
            clientId: data.sub_kind === 'client' ? data.sub : null,
        },
        grants: scopes.includes(ScopeName.GLOBAL) ? data.permissions : [],
    };
}

/** One catalog read per request/connection; all subsequent checks run locally. */
export async function createAuthupPermissionEvaluator(
    client: Pick<IClient, 'authorization'>,
    input: Omit<AuthorizationEvaluatorInput, 'catalog'>,
): Promise<IPermissionEvaluator> {
    return createAuthorizationEvaluator({ ...input, catalog: await client.authorization.get() });
}
