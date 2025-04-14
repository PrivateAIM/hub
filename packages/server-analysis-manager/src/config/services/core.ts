/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@privateaim/core-http-kit';
import { isClientAuthenticationHookUsable, useClientAuthenticationHook } from '@privateaim/server-kit';
import { setCoreFactory } from '../../core';
import { useEnv } from '../env';

export function configureCoreService() {
    setCoreFactory(() => {
        const client = new Client({
            baseURL: useEnv('coreURL'),
        });

        if (isClientAuthenticationHookUsable()) {
            const hook = useClientAuthenticationHook();
            hook.attach(client);
        }

        return client;
    });
}
