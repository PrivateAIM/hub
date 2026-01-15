/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    isClientAuthenticationHookUsable, useClientAuthenticationHook,
    useLogger,
} from '@privateaim/server-kit';
import { APIClient } from '@privateaim/telemetry-kit';
import { setTelemetryClientFactory } from '../../services/index.ts';
import { useEnv } from '../env/index.ts';

export function configureTelemetryClient() {
    const baseURL = useEnv('telemetryURL');
    if (!baseURL) {
        useLogger().debug('Telemetry service url is not set.');
        return;
    }

    setTelemetryClientFactory(() => {
        const client = new APIClient({
            baseURL,
        });

        if (isClientAuthenticationHookUsable()) {
            const hook = useClientAuthenticationHook();
            hook.attach(client);
        }

        return client;
    });
}
