/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRedisClientUsable, useLogger } from '@privateaim/server-kit';
import type { Aggregator } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../config';
import { TelemetryAggregator } from './module';

export function createTelemetryAggregator() : Aggregator {
    if (!isRedisClientUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().warn('Telemetry aggregator has not been initialized');
            },
        };
    }

    return new TelemetryAggregator();
}
