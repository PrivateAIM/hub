#!/usr/bin/env node

/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import dotenv from 'dotenv';
import { runMain } from 'citty';
import { createCLIEntryPointCommand } from './module.ts';

dotenv.config({
    debug: false,
    quiet: true,
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

Promise.resolve()
    .then(() => createCLIEntryPointCommand())
    .then((command) => runMain(command))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
