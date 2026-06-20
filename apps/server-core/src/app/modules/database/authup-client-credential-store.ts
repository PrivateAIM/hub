/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomBytes } from 'node:crypto';
import type { AuthupClient } from '@privateaim/server-kit';
import type { ClientCredentials, IClientCredentialStore } from '../../../core/services/client-credential/index.ts';

/**
 * Authup-backed adapter for the {@link IClientCredentialStore} core port. Reads
 * the (select:false) client secret via the `+secret` field, and writes it via a
 * client update.
 */
export class AuthupClientCredentialStore implements IClientCredentialStore {
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

    async writeByClientId(clientId: string, secret?: string): Promise<ClientCredentials> {
        // Rotate by default (generate a fresh secret); otherwise set the caller's.
        const next = secret ?? randomBytes(32).toString('hex');

        const client = await this.authup.client.update(clientId, { secret: next });

        // Return the plaintext we wrote — the stored value may be hashed.
        return {
            id: client.id,
            secret: next,
        };
    }
}
