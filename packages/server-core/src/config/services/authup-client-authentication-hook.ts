/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientAuthenticationHook } from '@authup/core-http-kit';
import {
    guessAuthupTokenCreatorOptions,
    setClientAuthenticationHookFactory,
    useLogger,
} from '@privateaim/server-kit';
import { useEnv } from '../env/index.ts';

export function configureAuthupClientAuthenticationHook() {
    const baseURL = useEnv('authupURL');
    if (!baseURL) {
        useLogger().debug('Authup service url is not set.');
        return;
    }

    setClientAuthenticationHookFactory(() => new ClientAuthenticationHook({
        baseURL,
        tokenCreator: guessAuthupTokenCreatorOptions(),
    }));
}
