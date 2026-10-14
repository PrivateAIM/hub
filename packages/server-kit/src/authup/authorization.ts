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
import type { AuthupPolicySubject, AuthupPolicySubjectInput } from './types.ts';

/**
 * What a policy may see for a token: ALWAYS its identity, and its grants only
 * when the token's scopes include `global`. Shared by the HTTP and socket
 * middlewares so hub spells the gate once.
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
 * This deliberately DIVERGES from authup's own `useRequestPolicyIdentity`,
 * which removes the identity altogether for a non-`global` token; a change
 * upstream to match this behaviour (withhold capabilities, keep the identity)
 * is being proposed.
 */
export function resolveAuthupPolicySubject(input: AuthupPolicySubjectInput): AuthupPolicySubject {
    return {
        identity: input.identity,
        grants: input.scopes.includes(ScopeName.GLOBAL) ? input.grants : [],
    };
}

/** One catalog read per request/connection; all subsequent checks run locally. */
export async function createAuthupPermissionEvaluator(
    client: Pick<IClient, 'authorization'>,
    input: Omit<AuthorizationEvaluatorInput, 'catalog'>,
): Promise<IPermissionEvaluator> {
    return createAuthorizationEvaluator({ ...input, catalog: await client.authorization.get() });
}
