/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ClientCredentials,
    IClientCredentialReader,
} from '../../../../../src/core/services/client-credential/index.ts';

/**
 * In-memory {@link IClientCredentialReader} that records the client ids it was
 * asked for and returns a fixed secret. Lets the credential service tests assert
 * authorization without touching Authup.
 */
export class FakeClientCredentialReader implements IClientCredentialReader {
    public calls: string[] = [];

    constructor(private secret: string | null = 'the-secret') {}

    async readByClientId(clientId: string): Promise<ClientCredentials> {
        this.calls.push(clientId);
        return { id: clientId, secret: this.secret };
    }
}
