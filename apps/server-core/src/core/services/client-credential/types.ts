/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from '@authup/core-kit';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * The subset of an OAuth2 client a credential consumer needs — identity, the
 * human-facing labels and the secret. Projected from the Authup {@link Client}.
 */
export type ClientCredentials = {
    id: Client['id'];
    name: Client['name'];
    display_name: Client['displayName'];
    secret: Client['secret'];
};

/**
 * Patch applied to an OAuth2 client's credentials. An omitted `secret` rotates
 * to a fresh random one; an omitted `name` / `display_name` leaves that field
 * unchanged. Projected from the Authup {@link Client}.
 */
export type ClientCredentialsUpdate = Partial<{
    secret: Client['secret'];
    name: Client['name'];
    display_name: Client['displayName'];
}>;

/**
 * Port for reading and writing an OAuth2 client's credentials (id, name,
 * secret) by its id. The concrete, Authup-backed adapter lives in the app
 * layer, keeping the credential services free of any infrastructure client.
 */
export interface IClientCredentialStore {
    readByClientId(clientId: string): Promise<ClientCredentials>;

    /**
     * Apply a credentials patch. When `secret` is omitted, a new random secret
     * is generated; when `name` is omitted, the name is left unchanged. Returns
     * the (plaintext) credentials that were written.
     */
    writeByClientId(clientId: string, data?: ClientCredentialsUpdate): Promise<ClientCredentials>;
}

export interface INodeClientCredentialService {
    getCredentials(nodeId: string, actor: ActorContext): Promise<ClientCredentials>;
    setCredentials(nodeId: string, data: ClientCredentialsUpdate, actor: ActorContext): Promise<ClientCredentials>;
}

export interface IAnalysisClientCredentialService {
    getCredentials(analysisId: string, actor: ActorContext): Promise<ClientCredentials>;
    setCredentials(analysisId: string, secret: string | undefined, actor: ActorContext): Promise<ClientCredentials>;
}
