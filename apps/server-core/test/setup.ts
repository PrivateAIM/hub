/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import { wait } from '@privateaim/kit';
import { LoggerModule } from '@privateaim/server-kit';
import { provideAuthup, provideDatabase, stopTestContainers } from '@privateaim/server-test-kit';
import { Application } from 'orkos';
import type { TestProject } from 'vitest/node';
import { ConfigModule } from '../src/app/modules/config/index.ts';
import { createTestDatabaseModuleForSetup } from './app/index.ts';

async function setup(project: TestProject) {
    // Provide a database + Authup instance: an externally configured service
    // (CI) is used as-is, otherwise a testcontainer is started.
    await provideDatabase(project);
    await provideAuthup(project);

    // Create the schema once so the per-test-app synchronizes are no-ops
    // (avoids concurrent CREATE TABLE races on the shared database).
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

async function teardown() {
    await stopTestContainers();
}

export {
    setup,
    teardown,
};
