/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { ClientAuthenticationHookOptions } from '@authup/core-http-kit';
import type { IModule } from 'orkos';
import { AUTHUP_HOOK_MODULE_NAME, AuthupClientAuthenticationHookInjectionKey  } from './constants';
import { createAuthupClientAuthenticationHook } from './setup';

export type AuthupHookModuleOptions = ClientAuthenticationHookOptions;

export class AuthupHookModule implements IModule {
    readonly name = AUTHUP_HOOK_MODULE_NAME;

    readonly dependencies: string[] = [];

    private options: AuthupHookModuleOptions;

    constructor(options: AuthupHookModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const hook = createAuthupClientAuthenticationHook(this.options);
        container.register(AuthupClientAuthenticationHookInjectionKey, { useValue: hook });
    }
}
