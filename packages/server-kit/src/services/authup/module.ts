/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptions, TokenCreatorOptions } from '@authup/core-http-kit';
import {
    Client, mountClientResponseErrorTokenHook as mountAuthupClientResponseErrorTokenHook,
    mountClientResponseErrorTokenHook,
} from '@authup/core-http-kit';
import { isVaultClientUsable, useVaultClient } from '../vault';

export {
    mountAuthupClientResponseErrorTokenHook,
};

export class AuthupClient extends Client {
    constructor(options: ClientOptions = {}) {
        super(options);

        let tokenCreator : TokenCreatorOptions;
        if (isVaultClientUsable()) {
            tokenCreator = {
                type: 'robotInVault',
                name: 'system',
                vault: useVaultClient(),
            };
        } else {
            tokenCreator = {
                type: 'user',
                name: 'admin',
                password: 'start123',
            };
        }

        mountClientResponseErrorTokenHook(this, {
            baseURL: options.baseURL,
            tokenCreator,
        });
    }
}
