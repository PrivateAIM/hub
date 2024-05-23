/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createLogger, setLoggerFactory } from '@privateaim/server-kit';
import { WRITABLE_DIRECTORY_PATH } from '../constants';

export function setupLogger(): void {
    setLoggerFactory(() => createLogger({
        directory: WRITABLE_DIRECTORY_PATH,
    }));
}
