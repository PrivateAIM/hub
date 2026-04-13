/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { ModuleName } from '../../module-names';
import { AuthupClientAuthenticationHookInjectionKey } from '../client-hook/constants';
import { AuthupClientInjectionKey } from './constants';
import { AuthupClient } from './module';
import { setAuthupClientFactory } from './singleton';

export type AuthupModuleOptions = {
    baseURL: string;
};

export class AuthupModule implements IModule {
    readonly name = ModuleName.AUTHUP;

    readonly dependencies: (string | ModuleDependency)[] = [{ name: ModuleName.AUTHUP_HOOK, optional: true }];

    private options: AuthupModuleOptions;

    constructor(options: AuthupModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const client = new AuthupClient({ baseURL: this.options.baseURL });

        const hookResult = container.tryResolve(AuthupClientAuthenticationHookInjectionKey);
        if (hookResult.success) {
            hookResult.data.attach(client);
        }

        container.register(AuthupClientInjectionKey, { useValue: client });

        // Bridge: back-fill singa singleton
        setAuthupClientFactory(() => client);
    }
}
