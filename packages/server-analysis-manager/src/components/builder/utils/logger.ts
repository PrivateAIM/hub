/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { createLogger } from '@privateaim/server-kit';
import { ComponentName } from '@privateaim/server-analysis-manager-kit';
import { LoggerTransport, isLogComponentServiceUsable, useLogComponentService } from '@privateaim/server-telemetry-kit';
import { useEnv } from '../../../config';

import { WRITABLE_DIRECTORY_PATH } from '../../../constants';

let instance : Logger | undefined;

export function useBuilderLogger() : Logger {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    const transport = new LoggerTransport({
        labels: {
            service: 'hub-server-worker',
            namespace: useEnv('env'),
            type: 'system',
            component: ComponentName.BUILDER,
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
    });

    instance = createLogger({
        options: {
            defaultMeta: {
                component: ComponentName.BUILDER,
            },
        },
        transports: [transport],
        // todo: allow customizing specific path
        directory: WRITABLE_DIRECTORY_PATH,
    });

    return instance;
}
