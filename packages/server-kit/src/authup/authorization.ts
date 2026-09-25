/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationEvaluatorInput, IPermissionEvaluator } from '@authup/access';
import { createAuthorizationEvaluator } from '@authup/access';
import type { IClient } from '@authup/core-http-kit';

/** One catalog read per request/connection; all subsequent checks run locally. */
export async function createAuthupPermissionEvaluator(
    client: Pick<IClient, 'authorization'>,
    input: Omit<AuthorizationEvaluatorInput, 'catalog'>,
): Promise<IPermissionEvaluator> {
    return createAuthorizationEvaluator({ ...input, catalog: await client.authorization.get() });
}
