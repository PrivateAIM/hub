/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import 'reflect-metadata';

import type { TestProject } from 'vitest/node';
import { GenericContainer, Wait } from 'testcontainers';
import { PermissionName } from '@privateaim/kit';
import { LoggerModule } from '@privateaim/server-kit';
import { provideAuthup, provideDatabase, stopTestContainers } from '@privateaim/server-test-kit';
import { Application } from 'orkos';
import { ConfigModule } from '../src/app/modules/config/index.ts';
import { createTestDatabaseModule } from './app/database.ts';

declare module 'vitest' {
    export interface ProvidedContext {
        VL_CONTAINER_HOST: string
        VL_CONTAINER_PORT: number
    }
}

// The permissions server-telemetry's authorization middleware checks.
const PERMISSIONS: PermissionName[] = [
    PermissionName.EVENT_CREATE,
    PermissionName.EVENT_READ,
    PermissionName.EVENT_DELETE,
    PermissionName.LOG_CREATE,
    PermissionName.LOG_READ,
    PermissionName.LOG_DELETE,
];

async function setup(project: TestProject) {
    const containerConfig = new GenericContainer('docker.io/victoriametrics/victoria-logs:v1.43.1')
        .withExposedPorts(9428)
        .withWaitStrategy(Wait.forHttp('/health', 9428));

    const container = await containerConfig.start();

    project.provide('VL_CONTAINER_HOST', container.getHost());
    project.provide('VL_CONTAINER_PORT', container.getFirstMappedPort());

    globalThis.VL_CONTAINER = container;

    // Provide a database + Authup instance: an externally configured service
    // (CI) is used as-is, otherwise a testcontainer is started.
    await provideDatabase(project);
    await provideAuthup(project, PERMISSIONS);

    const app = new Application({
        modules: [
            new ConfigModule(),
            new LoggerModule(),
            createTestDatabaseModule(),
        ],
    });

    await app.setup();
    await app.teardown();
}

async function teardown() {
    await globalThis.VL_CONTAINER.stop();
    await stopTestContainers();
}

export {
    setup,
    teardown,
};
