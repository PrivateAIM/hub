/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import { PermissionName, wait } from '@privateaim/kit';
import { LoggerModule } from '@privateaim/server-kit';
import { provideAuthup, provideDatabase, stopTestContainers } from '@privateaim/server-test-kit';
import { Application } from 'orkos';
import type { TestProject } from 'vitest/node';
import { ConfigModule } from '../src/app/modules/config/index.ts';
import { createTestDatabaseModuleForSetup } from './app/index.ts';

// The permissions server-core's authorization middleware checks. Provisioned into
// the test Authup so the admin/master token resolves them.
const PERMISSIONS: PermissionName[] = [
    PermissionName.NODE_CREATE,
    PermissionName.NODE_UPDATE,
    PermissionName.NODE_DELETE,
    PermissionName.PROJECT_CREATE,
    PermissionName.PROJECT_UPDATE,
    PermissionName.PROJECT_DELETE,
    PermissionName.PROJECT_APPROVE,
    PermissionName.ANALYSIS_CREATE,
    PermissionName.ANALYSIS_UPDATE,
    PermissionName.ANALYSIS_DELETE,
    PermissionName.ANALYSIS_APPROVE,
    PermissionName.ANALYSIS_EXECUTION_START,
    PermissionName.ANALYSIS_EXECUTION_STOP,
    PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE,
    PermissionName.ANALYSIS_SELF_STORAGE_USE,
    PermissionName.MASTER_IMAGE_MANAGE,
    PermissionName.MASTER_IMAGE_GROUP_MANAGE,
    PermissionName.REGISTRY_MANAGE,
    PermissionName.REGISTRY_PROJECT_MANAGE,
];

async function setup(project: TestProject) {
    // Provide a database + Authup instance: an externally configured service
    // (CI) is used as-is, otherwise a testcontainer is started.
    await provideDatabase(project);
    await provideAuthup(project, PERMISSIONS);

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
