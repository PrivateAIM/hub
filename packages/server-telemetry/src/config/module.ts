/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    configureAMQP,
    configureAuthup,
    configureEntityEventPublisher,
    configureRedis,
    configureVault,
    configureVictoriaLogs,
    setupLogging,
} from './services';

export function configure() {
    configureVictoriaLogs();

    setupLogging();

    configureAMQP();
    configureRedis();
    configureAuthup();
    configureVault();

    configureEntityEventPublisher();
}
