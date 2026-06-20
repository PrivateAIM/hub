/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ActorContext } from '@privateaim/server-kit';

export type ClientCredentials = {
    id: string;
    secret: string | null;
};

/**
 * Port for reading and writing an OAuth2 client's credentials (id + secret) by
 * its id. The concrete, Authup-backed adapter lives in the app layer, keeping
 * the credential services free of any infrastructure client.
 */
export interface IClientCredentialStore {
    readByClientId(clientId: string): Promise<ClientCredentials>;

    /**
     * Set the client's secret. When `secret` is omitted, a new random secret is
     * generated. Returns the (plaintext) credentials that were written.
     */
    writeByClientId(clientId: string, secret?: string): Promise<ClientCredentials>;
}

export interface INodeClientCredentialService {
    getCredentials(nodeId: string, actor: ActorContext): Promise<ClientCredentials>;
    setCredentials(nodeId: string, secret: string | undefined, actor: ActorContext): Promise<ClientCredentials>;
}

export interface IAnalysisClientCredentialService {
    getCredentials(analysisId: string, actor: ActorContext): Promise<ClientCredentials>;
    setCredentials(analysisId: string, secret: string | undefined, actor: ActorContext): Promise<ClientCredentials>;
}
