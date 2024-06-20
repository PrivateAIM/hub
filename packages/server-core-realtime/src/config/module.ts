/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { WRITABLE_DIR_PATH } from './constants';
import { setupLogger, setupRedis, setupVault } from './services';

export function setupConfig() {
    setupLogger({
        directory: WRITABLE_DIR_PATH,
    });

    setupRedis();

    setupVault();
}
