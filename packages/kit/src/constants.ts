/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum EnvironmentName {
    TEST = 'test',
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
}

export enum ProcessEvent {
    STARTING = 'starting',
    STARTED = 'started',
    RUNNING = 'running',
    FAILED = 'failed',
    FINISHED = 'finished',
}
