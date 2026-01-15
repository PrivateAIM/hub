/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AuthupClient,
    setAuthupClientFactory,
    useLogger,
} from '@privateaim/server-kit';
import { useEnv } from '../env/index.ts';

export function configureAuthup() {
    const baseURL = useEnv('authupURL');
    if (!baseURL) {
        useLogger().debug('Authup service url is not set.');
        return;
    }

    setAuthupClientFactory(() => new AuthupClient({
        baseURL,
    }));
}
