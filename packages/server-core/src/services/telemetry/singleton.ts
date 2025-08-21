/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@privateaim/telemetry-kit';
import type { Factory } from 'singa';
import { singa } from 'singa';

const instance = singa<APIClient>({
    name: 'telemetryClient',
});

export function useTelemetryClient(): APIClient {
    return instance.use();
}

export function setTelemetryClientFactory(factory: Factory<APIClient>) {
    instance.setFactory(factory);
}

export function isTelemetryClientUsable() {
    return instance.hasFactory() || instance.has();
}
