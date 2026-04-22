/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BaseServerConfig } from '@privateaim/server-kit';

export interface Config extends BaseServerConfig {
    authupURL: string;
    redisConnectionString: string;
}
