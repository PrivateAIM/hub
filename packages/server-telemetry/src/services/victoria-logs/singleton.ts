/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { VictoriaLogsClient } from '@hapic/victorialogs';

const instance = singa<VictoriaLogsClient>({
    name: 'victoriaLogs',
});

export function setVictoriaLogsClientFactory(factory: Factory<VictoriaLogsClient>) {
    instance.setFactory(factory);
}

export function isVictoriaLogsClientUsable() {
    return instance.has() || instance.hasFactory();
}

export function useVictoriaLogsClient() {
    return instance.use();
}
