/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IPermissionEvaluator } from '@authup/access';
import type { CapabilityEntry } from '@privateaim/kit';

export type RequestIdentity = {
    id: string;
    type: 'user' | 'client',
    realmId: string,
    realmName: string
    attributes?: Record<string, any>,
};

export type RequestCapabilitySource = 'header' | 'query';

/**
 * A verified capability token. It names who delegated the capability
 * (`subject`) and who acts on it (`actor`), but it is NOT an identity: a
 * capability request carries no `identity` and no permission evaluator, and
 * may only touch the resources its `entries` name.
 */
export type RequestCapability = {
    subject: {
        id: string,
        type: 'user' | 'client',
        realmId: string,
        realmName?: string,
    },
    actor?: {
        id: string,
        type?: string,
    },
    entries: CapabilityEntry[],
    /**
     * `iat` and `exp`, in epoch seconds.
     */
    issuedAt: number,
    expiresAt: number,
    /**
     * `query` only for a short-lived (<= 60 s) token passed as `?dt=`; only
     * `ForceIdentityOrStreamCapabilityMiddleware` routes accept one.
     */
    source: RequestCapabilitySource,
};

export type RequestEnv = {
    permissionEvaluator?: IPermissionEvaluator,

    identity?: RequestIdentity,

    scopes?: string[],

    capability?: RequestCapability,

    /**
     * The raw access token of an identity request (the `Authorization` header), for a
     * service exchanging it on the caller's behalf. Never a capability token.
     */
    token?: string,
};
