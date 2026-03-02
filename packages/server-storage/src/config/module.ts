/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    configureAMQP,
    configureAuthup,
    configureAuthupClientAuthenticationHook,
    configureEventPublisher,
    configureMinio,
    configureRedis,
    setupLogging,
} from './services/index.ts';

export function configure() {
    setupLogging();

    configureAuthupClientAuthenticationHook();

    configureAMQP();
    configureRedis();
    configureMinio();
    configureAuthup();

    configureEventPublisher();
}
