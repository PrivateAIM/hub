/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientResponseErrorTokenHookOptions } from '@authup/core-http-kit';
import {
    Client, mountClientResponseErrorTokenHook as mountAuthupClientResponseErrorTokenHook,
    mountClientResponseErrorTokenHook,
} from '@authup/core-http-kit';
import { guessAuthupTokenCreatorOptions } from './helpers';
import type { AuthupClientOptions } from './types';

export {
    mountAuthupClientResponseErrorTokenHook,
};

export class AuthupClient extends Client {
    constructor(options: AuthupClientOptions = {}) {
        super(options);

        let tokenHook : ClientResponseErrorTokenHookOptions;
        if (options.tokenHook) {
            tokenHook = options.tokenHook;
            tokenHook.baseURL = tokenHook.baseURL || options.baseURL;
        } else {
            const tokenCreator = guessAuthupTokenCreatorOptions();
            tokenHook = {
                baseURL: options.baseURL,
                tokenCreator,
            };
        }

        mountClientResponseErrorTokenHook(this, tokenHook);
    }
}
