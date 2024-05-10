/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { mountClientResponseErrorTokenHook } from '@authup/core-http-kit';
import type { TokenCreator, TokenCreatorOptions } from '@authup/core-http-kit';
import { APIClient } from '@privateaim/storage-kit';
import { setStorageFactory } from '../../core';
import { useEnv } from '../env';

type StorageServiceConfigurationContext = {
    tokenCreator: TokenCreatorOptions | TokenCreator
};
export function configureStorageService(context: StorageServiceConfigurationContext) {
    setStorageFactory(() => {
        const client = new APIClient({
            baseURL: useEnv('storageURL'),
        });

        mountClientResponseErrorTokenHook(client, {
            tokenCreator: context.tokenCreator,
            baseURL: useEnv('authupURL'),
        });

        return client;
    });
}
