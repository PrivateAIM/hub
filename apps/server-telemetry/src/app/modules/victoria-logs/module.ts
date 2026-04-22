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
import { ConfigInjectionKey } from '../config/constants.ts';
import type { Config } from '../config/types.ts';
import { LogStoreInjectionKey, VictoriaLogsClientInjectionKey } from './constants.ts';

export class VictoriaLogsModule implements IModule {
    readonly name = 'victoriaLogs';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const envConfig = container.resolve(ConfigInjectionKey) as Config;
        const baseURL = envConfig.victoriaLogsURL ?? undefined;
        const ingestorURL = envConfig.victoriaLogsIngestorURL ?? undefined;
        const querierURL = envConfig.victoriaLogsQuerierURL ?? undefined;

        if (!baseURL && !ingestorURL && !querierURL) {
            container.register(LogStoreInjectionKey, { useValue: new MemoryLogStore() });
            return;
        }

        const config: ConfigInput = {};
        if (baseURL) {
            config.request = { baseURL };
        }

        if (ingestorURL || querierURL) {
            config.options = {};
            if (ingestorURL) {
                config.options.ingesterURL = ingestorURL;
            }
            if (querierURL) {
                config.options.querierURL = querierURL;
            }
        }

        const client = new VictoriaLogsClient(config);
        container.register(VictoriaLogsClientInjectionKey, { useValue: client });
        container.register(LogStoreInjectionKey, { useValue: new VictoriaLogsLogStore(client) });
    }
}
