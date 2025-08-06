/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import process from 'node:process';
import {
    configureAMQP,
    configureAuthup,
    configureRedis,
    configureVault,
    setupLogging,
} from './services';

export function configure() {
    setupLogging({
        directory: path.join(process.cwd(), 'writable'),
    });

    configureAMQP();
    configureRedis();
    configureAuthup();
    configureVault();
}
