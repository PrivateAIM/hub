/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import 'reflect-metadata';

import type { TestProject } from 'vitest/node';
import { GenericContainer, Wait } from 'testcontainers';

declare module 'vitest' {
    export interface ProvidedContext {
        VL_CONTAINER_HOST: string
        VL_CONTAINER_PORT: number
    }
}

async function setup(project: TestProject) {
    const containerConfig = new GenericContainer('docker.io/victoriametrics/victoria-logs:v1.43.1')
        .withExposedPorts(9428)
        .withWaitStrategy(Wait.forHttp('/health', 9428));

    const container = await containerConfig.start();

    project.provide('VL_CONTAINER_HOST', container.getHost());
    project.provide('VL_CONTAINER_PORT', container.getFirstMappedPort());

    globalThis.VL_CONTAINER = container;
}

async function teardown() {
    await globalThis.VL_CONTAINER.stop();
}

export {
    setup,
    teardown,
};
