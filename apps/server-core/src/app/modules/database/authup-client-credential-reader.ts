/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthupClient } from '@privateaim/server-kit';
import type { ClientCredentials, IClientCredentialReader } from '../../../core/services/client-credential/index.ts';

/**
 * Authup-backed adapter for the {@link IClientCredentialReader} core port.
 * Reads the (select:false) client secret from Authup via the `+secret` field.
 */
export class AuthupClientCredentialReader implements IClientCredentialReader {
    protected authup: AuthupClient;

    constructor(authup: AuthupClient) {
        this.authup = authup;
    }

    async readByClientId(clientId: string): Promise<ClientCredentials> {
        const client = await this.authup.client.getOne(clientId, { fields: ['+secret'] });

        return {
            id: client.id,
            secret: client.secret ?? null,
        };
    }
}
