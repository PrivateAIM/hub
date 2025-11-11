/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    type Component, EnvironmentName, isRedisClientUsable,
    useLogger,
} from '@privateaim/server-kit';
import { useEnv } from '../../config';
import { TelemetryAggregator } from './module';

export function createTelemetryAggregator() : Component {
    if (!isRedisClientUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().debug('Telemetry aggregator has not been initialized');
            },
        };
    }

    return new TelemetryAggregator();
}
