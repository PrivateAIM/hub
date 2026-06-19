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
 * Port for reading an OAuth2 client's credentials (id + secret) by its id.
 * The concrete, Authup-backed adapter lives in the app layer, keeping the
 * credential services free of any infrastructure client.
 */
export interface IClientCredentialReader {
    readByClientId(clientId: string): Promise<ClientCredentials>;
}

export interface INodeClientCredentialService {
    getCredentials(nodeId: string, actor: ActorContext): Promise<ClientCredentials>;
}

export interface IAnalysisClientCredentialService {
    getCredentials(analysisId: string, actor: ActorContext): Promise<ClientCredentials>;
}
