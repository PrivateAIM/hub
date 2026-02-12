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

export enum ProcessStatus {
    STARTING = 'starting',
    STARTED = 'started',
    STOPPING = 'stopping',
    STOPPED = 'stopped',
    EXECUTING = 'executing',
    EXECUTED = 'executed',
    FAILED = 'failed',
}

export const MINUTE_IN_MS = 1000 * 60;
export const HOUR_IN_MS = MINUTE_IN_MS * 60;
export const DAY_IN_MS = HOUR_IN_MS * 24;
export const WEEK_IN_MS = DAY_IN_MS * 7;
export const MONTH_IN_MS = WEEK_IN_MS * 4;
