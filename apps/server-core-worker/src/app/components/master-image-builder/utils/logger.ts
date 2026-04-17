/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { Logger, QueueRouter } from '@privateaim/server-kit';
import { LoggerConsoleTransport, createLogger } from '@privateaim/server-kit';
import { ComponentName } from '@privateaim/server-core-worker-kit';
import { LogComponentCaller, LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';

let instance : Logger | undefined;

export function createMasterImageBuilderLogger(queueRouter?: QueueRouter) : Logger {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    const logCaller = queueRouter ? new LogComponentCaller({ queueRouter }) : undefined;

    instance = createLogger({
        options: { defaultMeta: { component: ComponentName.MASTER_IMAGE_BUILDER } },
        transports: [
            new LoggerConsoleTransport(),
            new LoggerTransport({
                labels: {
                    [LogFlag.SERVICE]: 'hub-server-worker',
                    [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                    [LogFlag.COMPONENT]: ComponentName.MASTER_IMAGE_BUILDER,
                    [LogFlag.REF_TYPE]: DomainType.MASTER_IMAGE,
                },
                save: async (data) => {
                    if (logCaller) {
                        await logCaller.callWrite(data);
                    }
                },
            }),
        ],
    });

    return instance;
}
