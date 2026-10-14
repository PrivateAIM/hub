/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import 'reflect-metadata';

import type { TestProject } from 'vitest/node';
import { provideAuthup, provideDatabase, stopTestContainers } from '@privateaim/server-test-kit';
import { TestDatabase } from './utils/index.ts';

async function setup(project: TestProject) {
    // An externally configured database / Authup (CI) is used as-is,
    // otherwise a testcontainer is started. server-messenger checks no
    // permission names — it authorizes by identity only — so Authup is
    // provisioned with none; it is still required to authenticate at all.
    await provideDatabase(project, 'messenger');
    await provideAuthup(project, []);

    // create the schema once so the per-test-app synchronizes are no-ops
    // (avoids concurrent CREATE TABLE races on the shared CI matrix database)
    const database = new TestDatabase();
    await database.setup();
}

async function teardown() {
    await stopTestContainers();
}

export {
    setup,
    teardown,
};
