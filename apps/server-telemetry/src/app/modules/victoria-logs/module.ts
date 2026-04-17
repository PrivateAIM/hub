/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { ConfigInput } from '@hapic/victorialogs';
import { VictoriaLogsClient } from '@hapic/victorialogs';
import type { IModule } from 'orkos';
import { VictoriaLogsLogStore } from '../../../adapters/telemetry/victoria-logs.ts';
import { MemoryLogStore } from '../../../adapters/telemetry/memory.ts';
import { LogStoreInjectionKey, VictoriaLogsClientInjectionKey } from './constants.ts';
import type { VictoriaLogsModuleOptions } from './types.ts';

export class VictoriaLogsModule implements IModule {
    readonly name = 'victoriaLogs';

    readonly dependencies: string[] = [];

    private options: VictoriaLogsModuleOptions;

    constructor(options: VictoriaLogsModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        if (!this.options.baseURL && !this.options.ingestorURL && !this.options.querierURL) {
            container.register(LogStoreInjectionKey, { useValue: new MemoryLogStore() });
            return;
        }

        const config: ConfigInput = {};
        if (this.options.baseURL) {
            config.request = { baseURL: this.options.baseURL };
        }

        if (this.options.ingestorURL || this.options.querierURL) {
            config.options = {};
            if (this.options.ingestorURL) {
                config.options.ingesterURL = this.options.ingestorURL;
            }
            if (this.options.querierURL) {
                config.options.querierURL = this.options.querierURL;
            }
        }

        const client = new VictoriaLogsClient(config);
        container.register(VictoriaLogsClientInjectionKey, { useValue: client });
        container.register(LogStoreInjectionKey, { useValue: new VictoriaLogsLogStore(client) });
    }
}
