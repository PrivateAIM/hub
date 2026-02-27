/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createAuthupTokenCreator,
    setupAuthupClientAuthenticationHook,
    useLogger,
} from '@privateaim/server-kit';
import { useEnv } from '../env';

export function configureAuthupClientAuthenticationHook() {
    const baseURL = useEnv('authupURL');
    if (!baseURL) {
        useLogger().debug('Authup service url is not set.');
        return;
    }

    setupAuthupClientAuthenticationHook({
        baseURL,
        creator: createAuthupTokenCreator({
            baseURL,
            clientId: useEnv('clientId'),
            clientSecret: useEnv('clientSecret'),
            realm: useEnv('realm'),
        }),
    });
}
