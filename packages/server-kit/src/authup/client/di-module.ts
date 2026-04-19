/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { AUTHUP_HOOK_MODULE_NAME, AuthupClientAuthenticationHookInjectionKey } from '../client-hook/constants';
import { AUTHUP_CLIENT_MODULE_NAME, AuthupClientInjectionKey } from './constants';
import { AuthupClient } from './module';

export type AuthupClientModuleOptions = {
    baseURL: string;
};

export class AuthupClientModule implements IModule {
    readonly name = AUTHUP_CLIENT_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [{ name: AUTHUP_HOOK_MODULE_NAME, optional: true }];

    private options: AuthupClientModuleOptions;

    constructor(options: AuthupClientModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const client = new AuthupClient({ baseURL: this.options.baseURL });

        const hookResult = container.tryResolve(AuthupClientAuthenticationHookInjectionKey);
        if (hookResult.success) {
            hookResult.data.attach(client);
        }

        container.register(AuthupClientInjectionKey, { useValue: client });
    }
}
