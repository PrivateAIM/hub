/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientAuthenticationHookUsable, useClientAuthenticationHook } from '@privateaim/server-kit';
import { APIClient } from '@privateaim/storage-kit';
import { setStorageFactory } from '../../core';
import { useEnv } from '../env';

export function configureStorageService() {
    setStorageFactory(() => {
        const client = new APIClient({
            baseURL: useEnv('storageURL'),
        });

        if (isClientAuthenticationHookUsable()) {
            const hook = useClientAuthenticationHook();
            hook.attach(client);
        }

        return client;
    });
}
