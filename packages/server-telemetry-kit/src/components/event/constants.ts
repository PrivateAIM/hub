/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum TelemetryEventEvent {
    STARTING = 'starting',
    STARTED = 'started',
    FINISHED = 'finished',
    FAILED = 'failed',
}

export enum TelemetryEventCommand {
    CREATE = 'create',
}

export const TelemetryEventEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'telemetryEventEvents',
};

export const TelemetryEventTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'telemetryEventTasks',
};
