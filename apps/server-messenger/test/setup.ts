/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import 'reflect-metadata';

import { TestDatabase } from './utils/index.ts';

async function setup() {
    // create the schema once so the per-test-app synchronizes are no-ops
    // (avoids concurrent CREATE TABLE races on the shared CI matrix database)
    const database = new TestDatabase();
    await database.setup();
}

async function teardown() {
    // nothing to clean up
}

export {
    setup,
    teardown,
};
