/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import 'reflect-metadata';

import type { TestProject } from 'vitest/node';
import { GenericContainer } from 'testcontainers';

declare module 'vitest' {
    export interface ProvidedContext {
        MINIO_CONTAINER_HOST: string
        MINIO_CONTAINER_PORT: number
    }
}

async function setup(project: TestProject) {
    const containerConfig = new GenericContainer('lazybit/minio')
        .withExposedPorts(9000)
        .withEnvironment({
            MINIO_ACCESS_KEY: 'admin',
            MINIO_SECRET_KEY: 'start123',
        });

    const container = await containerConfig.start();

    project.provide('MINIO_CONTAINER_HOST', container.getHost());
    project.provide('MINIO_CONTAINER_PORT', container.getFirstMappedPort());

    globalThis.MINIO_CONTAINER = container;
}

async function teardown() {
    await globalThis.MINIO_CONTAINER.stop();
}

export {
    setup,
    teardown,
};
