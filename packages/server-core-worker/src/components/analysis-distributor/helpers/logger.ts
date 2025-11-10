/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { Logger } from '@privateaim/server-kit';
import { LoggerConsoleTransport, createLogger } from '@privateaim/server-kit';
import { ComponentName } from '@privateaim/server-core-worker-kit';
import { LoggerTransport, isLogComponentServiceUsable, useLogComponentService } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';

let instance : Logger | undefined;

export function useAnalysisDistributorLogger() : Logger {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = createLogger({
        options: {
            defaultMeta: {
                component: ComponentName.ANALYSIS_DISTRIBUTOR,
            },
        },
        transports: [
            new LoggerConsoleTransport(),
            new LoggerTransport({
                labels: {
                    [LogFlag.SERVICE]: 'hub-server-worker',
                    [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                    [LogFlag.COMPONENT]: ComponentName.ANALYSIS_DISTRIBUTOR,
                    [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                },
                save: async (data) => {
                    if (isLogComponentServiceUsable()) {
                        const logComponent = useLogComponentService();
                        await logComponent.command({
                            command: 'write',
                            data,
                        });
                    }
                },
            }),
        ],
    });

    return instance;
}
