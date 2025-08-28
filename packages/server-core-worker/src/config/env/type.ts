/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EnvironmentName } from '@privateaim/server-kit';

export interface Environment {
    env: `${EnvironmentName}`,

    port: number,

    rabbitMqConnectionString: string,
    vaultConnectionString: string,

    coreURL: string,
    authupURL: string,
    storageURL: string,
}
