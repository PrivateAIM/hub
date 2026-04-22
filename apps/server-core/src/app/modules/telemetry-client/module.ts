/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { APIClient } from '@privateaim/telemetry-kit';
import { AUTHUP_HOOK_MODULE_NAME, AuthupClientAuthenticationHookInjectionKey } from '@privateaim/server-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { TelemetryClientInjectionKey } from './constants.ts';

export class TelemetryClientModule implements IModule {
    readonly name = 'telemetryClient';

    readonly dependencies: (string | ModuleDependency)[] = [
        'config',
        { name: AUTHUP_HOOK_MODULE_NAME, optional: true },
    ];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        if (!config.telemetryURL) {
            return;
        }

        const client = new APIClient({ baseURL: config.telemetryURL });

        const hookResult = container.tryResolve(AuthupClientAuthenticationHookInjectionKey);
        if (hookResult.success) {
            hookResult.data.attach(client);
        }

        container.register(TelemetryClientInjectionKey, { useValue: client });
    }
}
