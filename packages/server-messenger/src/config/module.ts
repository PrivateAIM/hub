/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    configureAMQP,
    setupLogger,
    setupRedis,
    setupVault,
} from './services';

export function configure() {
    setupLogger();

    configureAMQP();
    setupRedis();
    setupVault();
}
