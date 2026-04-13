/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreator } from '@authup/core-http-kit';
import { OAuth2Client } from '@hapic/oauth2';

export type AuthupClientTokenCreatorCreateContext = {
    baseURL: string,
    clientId: string,
    clientSecret: string,
    realm: string,
};

export function createAuthupClientTokenCreator(ctx: AuthupClientTokenCreatorCreateContext): TokenCreator {
    const client = new OAuth2Client({ request: { baseURL: ctx.baseURL } });

    return () => client.token.createWithClientCredentials({
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        realm_id: ctx.realm,
    });
}

export type AuthupUserTokenCreatorCreateContext = {
    baseURL: string,
    name: string,
    password: string,
    realm: string,
};

export function createAuthupUserTokenCreator(ctx: AuthupUserTokenCreatorCreateContext): TokenCreator {
    const client = new OAuth2Client({ request: { baseURL: ctx.baseURL } });

    return () => client.token.createWithPassword({
        username: ctx.name,
        password: ctx.password,
        realm_id: ctx.realm,
    });
}
