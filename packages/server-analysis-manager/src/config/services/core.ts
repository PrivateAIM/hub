/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { mountClientResponseErrorTokenHook } from '@authup/core';
import type { TokenCreator, TokenCreatorOptions } from '@authup/core';
import { APIClient } from '@privateaim/core';
import { setCoreFactory } from '../../core';
import { useEnv } from '../env';

type StorageServiceConfigurationContext = {
    tokenCreator: TokenCreatorOptions | TokenCreator
};
export function configureCoreService(context: StorageServiceConfigurationContext) {
    setCoreFactory(() => {
        const client = new APIClient({
            baseURL: useEnv('storageURL'),
        });

        mountClientResponseErrorTokenHook(client, {
            tokenCreator: context.tokenCreator,
            baseURL: useEnv('authupApiUrl'),
        });

        return client;
    });
}
