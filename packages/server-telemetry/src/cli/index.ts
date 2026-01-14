/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { runMain } from 'citty';
import dotenv from 'dotenv';
import { createCLIEntryPointCommand } from './module.ts';

dotenv.config({
    debug: false,
    quiet: true,
});

Promise.resolve()
    .then(() => createCLIEntryPointCommand())
    .then((command) => runMain(command));
