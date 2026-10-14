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
 * The identity (and the grants that belong to it) a policy may see for a
 * token: its own when the token's scopes include `global`, none otherwise.
 * Mirrors authup's `useRequestPolicyIdentity`, the one place upstream spells
 * that condition, and is shared by the HTTP and socket middlewares so hub
 * spells it once too.
 *
 * Without an identity the evaluator binds no grant, so every permission
 * whose definition carries the binding policy (authup attaches it to every
 * permission by default) denies. A token minted without `global` therefore
 * fails every PERMISSION check, as it does against authup itself. It still
 * authenticates, though, and the request identity is still attached — so
 * hub's identity-based paths (client/node ownership of credentials, the
 * messenger mailbox, bucket ownership, realm socket rooms) still honour it.
 * Grants are withheld together with the identity: the evaluator refuses
 * grants that belong to nobody.
 */
export function resolveAuthupPolicySubject(input: AuthupPolicySubjectInput): AuthupPolicySubject {
    if (!input.scopes.includes(ScopeName.GLOBAL)) {
        return {};
    }

    return { identity: input.identity, grants: input.grants };
}

/** One catalog read per request/connection; all subsequent checks run locally. */
export async function createAuthupPermissionEvaluator(
    client: Pick<IClient, 'authorization'>,
    input: Omit<AuthorizationEvaluatorInput, 'catalog'>,
): Promise<IPermissionEvaluator> {
    return createAuthorizationEvaluator({ ...input, catalog: await client.authorization.get() });
}
