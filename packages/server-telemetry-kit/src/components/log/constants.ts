/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageBusRoutingType } from '@privateaim/server-kit';

export enum LogEvent {
    STARTING = 'starting',
    STARTED = 'started',
    FINISHED = 'finished',
    FAILED = 'failed',
}

export enum LogCommand {
    WRITE = 'write',
}

export const LogEventMessageBusRouting = {
    type: MessageBusRoutingType.PUB_SUB,
    key: 'telemetryLogEvents',
};

export const LogTaskMessageBusRouting = {
    type: MessageBusRoutingType.WORK,
    key: 'telemetryLogTasks',
};
