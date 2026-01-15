/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AuthupClient, setAuthupClientFactory } from '@privateaim/server-kit';
import { useEnv } from '../env/index.ts';

export function configureAuthup() {
    const baseURL = useEnv('authupURL');
    if (!baseURL) {
        return;
    }

    setAuthupClientFactory(() => new AuthupClient({
        baseURL,
    }));
}
