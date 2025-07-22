/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import process from 'node:process';
import {
    configureAuthup,
    configureMinio,
    configureRedis,
    configureVault,
    setupLogging,
} from './services';

export function configure() {
    setupLogging({
        directory: path.join(process.cwd(), 'writable'),
    });

    configureRedis();
    configureMinio();
    configureAuthup();
    configureVault();
}
