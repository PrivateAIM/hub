/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageRoutingType } from 'hubwire';

export enum EventEvent {
    CREATION_STARTED = 'creationStarted',
    CREATION_FINISHED = 'creationFinished',
    CREATION_FAILED = 'creationFailed',
}

export enum EventCommand {
    CREATE = 'create',
}

export const EventTaskMessageBusRouting = {
    type: MessageRoutingType.WORK,
    key: 'telemetryEventTasks',
};
