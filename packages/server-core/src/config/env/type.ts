/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EnvironmentName } from './constants';

export interface Environment {
    env: `${EnvironmentName}`,
    port: number,

    jwtMaxAge: number,

    minioConnectionString?: string | boolean,
    redisConnectionString?: string | boolean,
    rabbitMqConnectionString?: string | boolean,
    vaultConnectionString: string | boolean,

    publicURL: string,
    authupApiURL: string,
    appURL: string,

    skipProjectApproval: boolean,
    skipAnalysisApproval: boolean,

    httpProxyAPIs: string | undefined,
}
