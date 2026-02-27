/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AuthupClient,
    isAuthupClientAuthenticationHookUsable,
    setAuthupClientFactory,
    useAuthupClientAuthenticationHook,
    useLogger,
} from '@privateaim/server-kit';
import { useEnv } from '../env/index.ts';

export function configureAuthup() {
    const baseURL = useEnv('authupURL');
    if (!baseURL) {
        useLogger().warn('Authup service URL is not set.');
        return;
    }

    setAuthupClientFactory(() => {
        const client = new AuthupClient({
            baseURL,
        });

        if (isAuthupClientAuthenticationHookUsable()) {
            const hook = useAuthupClientAuthenticationHook();
            hook.attach(client);
        }

        return client;
    });
}
