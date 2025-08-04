/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TelemetryEventCommand, TelemetryEventEvent } from './constants';
import type {
    TelemetryEventCreateCommandPayload,
    TelemetryEventCreateFailedEventPayload,
    TelemetryEventCreatePayload,
} from './create';

//-----------------------------------------------------------------------

type TelemetryEventCommandMapRaw = {
    [TelemetryEventCommand.CREATE]: TelemetryEventCreateCommandPayload
};

export type TelemetryEventCommandMap = {
    [K in keyof TelemetryEventCommandMapRaw as `${K}`]: TelemetryEventCommandMapRaw[K]
};

export type TelemetryEventCommandContext = {
    [K in keyof TelemetryEventCommandMap]: {
        command: K,
        data: TelemetryEventCommandMap[K]
    }
}[keyof TelemetryEventCommandMap];

//-----------------------------------------------------------------------

type TelemetryEventEventMapRaw = {
    [TelemetryEventEvent.STARTING]: TelemetryEventCreatePayload,
    [TelemetryEventEvent.STARTED]: TelemetryEventCreatePayload,
    [TelemetryEventEvent.FAILED]: TelemetryEventCreateFailedEventPayload,
};

export type TelemetryEventEventMap = {
    [K in keyof TelemetryEventEventMapRaw as `${K}`]: TelemetryEventEventMapRaw[K]
};

export type TelemetryEventEventContext = {
    [K in keyof TelemetryEventEventMap]: {
        event: K,
        data: TelemetryEventEventMap[K]
    }
}[keyof TelemetryEventEventMap];
