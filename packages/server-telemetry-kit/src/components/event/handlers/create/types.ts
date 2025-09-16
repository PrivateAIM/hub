/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';

export type EventCreateCommandPayload = Partial<Event>;

export type EventCreateFailedEventPayload = {
    id: string,
    error: Error
};

export type EventCreateEventPayload = {
    [key: string]: any,
};
