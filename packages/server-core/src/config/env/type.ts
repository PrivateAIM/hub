/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EnvironmentName } from './constants';

export interface Environment {
    env: `${EnvironmentName}`,
    port: number,

    jwtMaxAge: number,

    redisConnectionString?: string | boolean,
    rabbitMqConnectionString?: string | boolean,
    vaultConnectionString: string | boolean,
    lokiURL?: string,
    lokiCompactorURL?: string,
    lokiQuerierURL?: string,
    harborURL?: string,

    publicURL: string,
    authupURL?: string,
    appURL: string,

    masterImagesRepository: string,
    masterImagesOwner: string,
    masterImagesBranch: string,

    skipProjectApproval: boolean,
    skipAnalysisApproval: boolean
}
