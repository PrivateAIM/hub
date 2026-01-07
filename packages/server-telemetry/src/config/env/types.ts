/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EnvironmentName } from '@privateaim/kit';

export interface Environment {
    env: `${EnvironmentName}`,
    port: number,

    publicURL: string,

    rabbitMqConnectionString?: string | null,
    redisConnectionString?: string | null,
    vaultConnectionString?: string | null,
    authupURL?: string | null,

    victoriaLogsURL?: string | null,
    victoriaLogsIngestorURL?: string | null,
    victoriaLogsQuerierURL?: string | null,
}
