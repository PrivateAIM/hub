/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum EventEvent {
    CREATION_STARTED = 'creationStarted',
    CREATION_FINISHED = 'creationFinished',
    CREATION_FAILED = 'creationFailed',
}

export enum EventCommand {
    CREATE = 'create',
    CLEAN = 'clean',
}

export const EventEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'telemetryEventEvents',
};

export const EventTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'telemetryEventTasks',
};
