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

    redisConnectionString?: string,
    rabbitMqConnectionString?: string,
    vaultConnectionString?: string,
    harborURL?: string,

    publicURL: string,
    authupURL?: string,
    telemetryURL?: string,

    masterImagesRepository: string,
    masterImagesOwner: string,
    masterImagesBranch: string,

    skipProjectApproval: boolean,
    skipAnalysisApproval: boolean
}
