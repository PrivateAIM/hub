/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthupClientModuleOptions } from './types';

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { CONFIG_MODULE_NAME, ConfigInjectionKey } from '../../config/constants';
import { HTTPClientTimeout } from '../../constants';
import { AUTHUP_HOOK_MODULE_NAME, AuthupClientAuthenticationHookInjectionKey } from '../client-hook/constants';
import { AUTHUP_CLIENT_MODULE_NAME, AuthupClientInjectionKey } from './constants';
import { AuthupClient } from './module';



export class AuthupClientModule implements IModule {
    readonly name = AUTHUP_CLIENT_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: CONFIG_MODULE_NAME, optional: true },
        { name: AUTHUP_HOOK_MODULE_NAME, optional: true },
    ];

    private options: AuthupClientModuleOptions;

    constructor(options: AuthupClientModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        let { baseURL } = this.options;

        if (!baseURL) {
            const configResult = container.tryResolve(ConfigInjectionKey);

            if (configResult.success) {
                baseURL = configResult.data.authupURL;
            }
        }

        // Without a URL the token stays UNBOUND: consumers rely on
        // `tryResolve` yielding undefined (node/analysis client provisioning
        // is skipped, the authorization middleware refuses every token).
        //
        // Fake-wins guard: this module is MANDATORY in every app harness (it
        // feeds the authorization middleware across four apps), so a test
        // cannot omit it the way it can omit the core/storage/telemetry client
        // modules. An already-registered fake must not be clobbered.
        if (!baseURL || container.has(AuthupClientInjectionKey)) {
            return;
        }

        const client = new AuthupClient({ baseURL, timeout: HTTPClientTimeout.AUTHUP });

        const hookResult = container.tryResolve(AuthupClientAuthenticationHookInjectionKey);

        if (hookResult.success) {
            hookResult.data.attach(client);
        }

        container.register(AuthupClientInjectionKey, { useValue: client });
    }
}
