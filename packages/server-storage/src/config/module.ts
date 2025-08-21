/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    configureAuthup,
    configureMinio,
    configureRedis,
    configureVault,
    setupLogging,
} from './services';

export function configure() {
    setupLogging();

    configureRedis();
    configureMinio();
    configureAuthup();
    configureVault();
}
