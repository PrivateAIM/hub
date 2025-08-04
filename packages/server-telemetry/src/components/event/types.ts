/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EventCommand, EventEvent } from './constants';
import type {
    EventCreateCommandPayload,
    EventCreateEventPayload,
    EventCreateFailedEventPayload,
} from './handlers/create';

//-----------------------------------------------------------------------

type TelemetryEventCommandMapRaw = {
    [EventCommand.CREATE]: EventCreateCommandPayload,
    [EventCommand.CLEAN]: EventCreateCommandPayload,
};

export type EventCommandMap = {
    [K in keyof TelemetryEventCommandMapRaw as `${K}`]: TelemetryEventCommandMapRaw[K]
};

export type EventCommandContext = {
    [K in keyof EventCommandMap]: {
        command: K,
        data: EventCommandMap[K]
    }
}[keyof EventCommandMap];

//-----------------------------------------------------------------------

type EventEventMapRaw = {
    [EventEvent.STARTING]: EventCreateEventPayload,
    [EventEvent.STARTED]: EventCreateEventPayload,
    [EventEvent.FAILED]: EventCreateFailedEventPayload,
};

export type EventEventMap = {
    [K in keyof EventEventMapRaw as `${K}`]: EventEventMapRaw[K]
};

export type EventEventContext = {
    [K in keyof EventEventMap]: {
        event: K,
        data: EventEventMap[K]
    }
}[keyof EventEventMap];
