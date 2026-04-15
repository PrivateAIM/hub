/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import { wait } from '@privateaim/kit';
import { LoggerModule } from '@privateaim/server-kit';
import { Application } from 'orkos';
import { ConfigModule } from '../src/app/modules/config/index.ts';
import { createTestDatabaseModuleForSetup } from './app/index.ts';

async function setup() {
    const app = new Application({
        modules: [
            new ConfigModule(),
            new LoggerModule(),
            createTestDatabaseModuleForSetup(),
        ],
    });

    await app.setup();
    await app.teardown();

    await wait(0);
}

export {
    setup,
};
