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

export type AuthupClientTokenCreatorCreateContext = {
    baseURL: string,
    clientId: string,
    clientSecret: string,
    realm: string,
};

export type AuthupUserTokenCreatorCreateContext = {
    baseURL: string,
    name: string,
    password: string,
    realm: string,
};

export type AuthupTokenExchangeContext = {
    /**
     * Authup base URL; a sub-path is kept.
     */
    baseURL: string,
    clientId: string,
    clientSecret: string,
    /**
     * Realm id the acting client lives in.
     */
    realm: string,
};

export type AuthupTokenExchangeInput = {
    subjectToken: string,
    audience: string,
    /**
     * Capability entries, sent space-separated.
     */
    cap: string[],
    /**
     * Requested lifetime in seconds; Authup caps it at the capability's max age.
     */
    expiresIn?: number,
};

export type AuthupTokenExchangeResult = {
    token: string,
    expiresIn: number,
};

export type AuthupTokenExchangeBody = {
    access_token?: string,
    expires_in?: number,
    error?: string,
    error_description?: string,
};
