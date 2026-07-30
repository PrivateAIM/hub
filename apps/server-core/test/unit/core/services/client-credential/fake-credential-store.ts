/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ClientCredentials,
    ClientCredentialsUpdate,
    IClientCredentialStore,
} from '../../../../../src/core/services/client-credential/index.ts';

/**
 * In-memory {@link IClientCredentialStore} that records the client ids it was
 * asked for and the patches it was given, returning a fixed secret/name. Lets
 * the credential service tests assert authorization without touching Authup.
 */
export class FakeClientCredentialStore implements IClientCredentialStore {
    public calls: string[] = [];

    public writes: { clientId: string; data?: ClientCredentialsUpdate }[] = [];

    constructor(private secret: string | null = 'the-secret', private name: string | null = 'the-name') {}

    async readByClientId(clientId: string): Promise<ClientCredentials> {
        this.calls.push(clientId);
        return {
            id: clientId,
            name: this.name,
            displayName: null,
            secret: this.secret,
        };
    }

    async writeByClientId(clientId: string, data?: ClientCredentialsUpdate): Promise<ClientCredentials> {
        this.writes.push({ clientId, data });
        return {
            id: clientId,
            name: data?.name ?? this.name,
            displayName: data?.displayName ?? null,
            secret: data?.secret ?? 'generated-secret',
        };
    }
}
