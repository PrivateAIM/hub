/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { APIClient } from '@privateaim/storage-kit';
import { AUTHUP_HOOK_MODULE_NAME, AuthupClientAuthenticationHookInjectionKey } from '@privateaim/server-kit';
import { StorageClientInjectionKey } from './constants.ts';
import type { StorageClientModuleOptions } from './types.ts';

export class StorageClientModule implements IModule {
    readonly name = 'storageClient';

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: AUTHUP_HOOK_MODULE_NAME, optional: true },
    ];

    private options: StorageClientModuleOptions;

    constructor(options: StorageClientModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const client = new APIClient({ baseURL: this.options.baseURL });

        const hookResult = container.tryResolve(AuthupClientAuthenticationHookInjectionKey);
        if (hookResult.success) {
            hookResult.data.attach(client);
        }

        container.register(StorageClientInjectionKey, { useValue: client });
    }
}
