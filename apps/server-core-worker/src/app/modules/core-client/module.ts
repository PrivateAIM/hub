/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { Client } from '@privateaim/core-http-kit';
import { AuthupClientAuthenticationHookInjectionKey, ModuleName } from '@privateaim/server-kit';
import { setCoreClient } from '../../../core/core/module.ts';
import { CoreClientInjectionKey } from './constants.ts';
import type { CoreClientModuleOptions } from './types.ts';

export class CoreClientModule implements IModule {
    readonly name = 'coreClient';

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: ModuleName.AUTHUP_HOOK, optional: true },
    ];

    private options: CoreClientModuleOptions;

    constructor(options: CoreClientModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const client = new Client({ baseURL: this.options.baseURL });

        const hookResult = container.tryResolve(AuthupClientAuthenticationHookInjectionKey);
        if (hookResult.success) {
            hookResult.data.attach(client);
        }

        container.register(CoreClientInjectionKey, { useValue: client });

        setCoreClient(client);
    }
}
