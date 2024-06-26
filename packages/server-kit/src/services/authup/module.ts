/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptions } from '@authup/core-http-kit';
import {
    Client, mountClientResponseErrorTokenHook as mountAuthupClientResponseErrorTokenHook,
    mountClientResponseErrorTokenHook,
} from '@authup/core-http-kit';
import { guessAuthupTokenCreatorOptions } from './helpers';

export {
    mountAuthupClientResponseErrorTokenHook,
};

// todo: extend constructor options

export class AuthupClient extends Client {
    constructor(options: ClientOptions = {}) {
        super(options);

        mountClientResponseErrorTokenHook(this, {
            baseURL: options.baseURL,
            tokenCreator: guessAuthupTokenCreatorOptions(),
        });
    }
}
