/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client,
    ClientAuthenticationHook,
} from '@authup/core-http-kit';
import {
    isClientAuthenticationHookUsable,
    setClientAuthenticationHookFactory,
    useClientAuthenticationHook,
} from '../authup-client-authentication-hook';
import { guessAuthupTokenCreatorOptions } from './helpers';
import type { AuthupClientOptions } from './types';

export class AuthupClient extends Client {
    constructor(options: AuthupClientOptions = {}) {
        super(options);

        if (!isClientAuthenticationHookUsable()) {
            setClientAuthenticationHookFactory(
                () => new ClientAuthenticationHook({
                    baseURL: options.baseURL,
                    tokenCreator: options.tokenCreator || guessAuthupTokenCreatorOptions(),
                }),
            );
        }

        const hook = useClientAuthenticationHook();
        hook.attach(this);
    }
}
