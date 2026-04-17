/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { APIClient } from '@privateaim/telemetry-kit';
import { AuthupClientAuthenticationHookInjectionKey, ModuleName } from '@privateaim/server-kit';
import { TelemetryClientInjectionKey } from './constants.ts';
import type { TelemetryClientModuleOptions } from './types.ts';

export class TelemetryClientModule implements IModule {
    readonly name = 'telemetryClient';

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: ModuleName.AUTHUP_HOOK, optional: true },
    ];

    private options: TelemetryClientModuleOptions;

    constructor(options: TelemetryClientModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const client = new APIClient({ baseURL: this.options.baseURL });

        const hookResult = container.tryResolve(AuthupClientAuthenticationHookInjectionKey);
        if (hookResult.success) {
            hookResult.data.attach(client);
        }

        container.register(TelemetryClientInjectionKey, { useValue: client });
    }
}
