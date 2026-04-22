/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { ClientAuthenticationHookOptions } from '@authup/core-http-kit';
import type { IModule, ModuleDependency } from 'orkos';
import { CONFIG_MODULE_NAME, ConfigInjectionKey } from '../../config/constants';
import { createAuthupClientTokenCreator } from '../token-creator';
import { AUTHUP_HOOK_MODULE_NAME, AuthupClientAuthenticationHookInjectionKey  } from './constants';
import { createAuthupClientAuthenticationHook } from './setup';

export type AuthupHookModuleOptions = ClientAuthenticationHookOptions;

export class AuthupHookModule implements IModule {
    readonly name = AUTHUP_HOOK_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: CONFIG_MODULE_NAME, optional: true },
    ];

    private options?: AuthupHookModuleOptions;

    constructor(options?: AuthupHookModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        let { options } = this;

        if (!options) {
            const configResult = container.tryResolve(ConfigInjectionKey);
            if (!configResult.success || !configResult.data.authupURL) {
                return;
            }

            const config = configResult.data;
            options = {
                baseURL: config.authupURL,
                tokenCreator: createAuthupClientTokenCreator({
                    baseURL: config.authupURL,
                    clientId: config.clientId,
                    clientSecret: config.clientSecret,
                    realm: config.realm,
                }),
            };
        }

        const hook = createAuthupClientAuthenticationHook(options);
        container.register(AuthupClientAuthenticationHookInjectionKey, { useValue: hook });
    }
}
