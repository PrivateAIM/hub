/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core';
import { APIClient, mountClientResponseErrorTokenHook } from '@authup/core';
import { hasVaultClient, setAuthupFactory, useVaultClient } from '../../core';
import { useEnv } from '../env';

export function configureAuthup() {
    const baseURL = useEnv('authupApiURL');
    if (typeof baseURL !== 'string') {
        return;
    }

    setAuthupFactory(() => {
        const authupClient = new APIClient({
            baseURL,
        });

        let tokenCreator : TokenCreatorOptions;
        if (hasVaultClient()) {
            tokenCreator = {
                type: 'robotInVault',
                name: 'system',
                vault: useVaultClient(),
            };
        } else {
            tokenCreator = {
                type: 'user',
                name: 'admin',
                password: 'start123',
            };
        }

        mountClientResponseErrorTokenHook(authupClient, {
            baseURL,
            tokenCreator,
        });

        return authupClient;
    });
}
