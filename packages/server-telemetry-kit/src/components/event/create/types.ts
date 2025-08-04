/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type TelemetryEventCreateCommandPayload = {
    [key: string]: any,
    // todo: domain type of event :)
};

export type TelemetryEventCreateFailedEventPayload = {
    id: string,
    error: Error
};

export type TelemetryEventCreatePayload = {
    [key: string]: any,
};
