/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { APIClient } from '@privateaim/storage-kit';
import { AuthupClientAuthenticationHookInjectionKey, ModuleName } from '@privateaim/server-kit';
import { setStorageFactory } from '../../../core/index.ts';
import { StorageClientInjectionKey } from './constants.ts';
import type { StorageClientModuleOptions } from './types.ts';

export class StorageClientModule implements IModule {
    readonly name = 'storageClient';

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: ModuleName.AUTHUP_HOOK, optional: true },
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

        // Bridge: back-fill singa singleton
        setStorageFactory(() => client);
    }
}
