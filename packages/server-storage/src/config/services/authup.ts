/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIClient, mountClientResponseErrorTokenHook } from '@authup/core';
import { setAuthupClientFactory } from '../../core';
import { useEnv } from '../env';

export function configureAuthup() {
    setAuthupClientFactory(() => {
        const baseURL = useEnv('authupURL');
        const authupClient = new APIClient({
            baseURL,
        });

        // todo use vault for token creation

        mountClientResponseErrorTokenHook(authupClient, {
            baseURL,
            tokenCreator: {
                type: 'user',
                name: 'admin',
                password: 'start123',
            },
        });

        return authupClient;
    });
}
