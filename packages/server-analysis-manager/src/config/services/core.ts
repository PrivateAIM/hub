/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientResponseErrorTokenHook } from '@authup/core-http-kit';
import type { TokenCreator, TokenCreatorOptions } from '@authup/core-http-kit';
import { Client } from '@privateaim/core-http-kit';
import { setCoreFactory } from '../../core';
import { useEnv } from '../env';

type StorageServiceConfigurationContext = {
    tokenCreator: TokenCreatorOptions | TokenCreator
};
export function configureCoreService(context: StorageServiceConfigurationContext) {
    setCoreFactory(() => {
        const client = new Client({
            baseURL: useEnv('coreURL'),
        });

        const hook = new ClientResponseErrorTokenHook({
            tokenCreator: context.tokenCreator,
            baseURL: useEnv('authupURL'),
        });

        hook.mount(client);

        return client;
    });
}
