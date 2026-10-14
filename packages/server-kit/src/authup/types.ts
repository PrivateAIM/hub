/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationEvaluatorInput } from '@authup/access';
import type { OAuth2TokenPayload, OAuth2TokenPermission } from '@authup/specs';

export type AuthupPolicySubject = Omit<AuthorizationEvaluatorInput, 'catalog'>;

/**
 * The part of a token's introspection (`TokenVerificationData`) a policy
 * subject is built from.
 */
export type AuthupTokenSubjectData = Pick<
    OAuth2TokenPayload,
    'sub' | 'sub_kind' | 'realm_id' | 'realm_name' | 'scope'
> & {
    permissions: OAuth2TokenPermission[],
};
