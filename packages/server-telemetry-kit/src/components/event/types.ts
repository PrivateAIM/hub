/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { Event } from '@privateaim/telemetry-kit';
import type { EventCommand, EventEvent } from './constants';
import type {
    EventCreateCommandPayload,
    EventCreateEventPayload,
    EventCreateFailedEventPayload,
} from './handlers';

//-----------------------------------------------------------------------

export type EventComponentEventMap = ObjectLiteralKeys<{
    [EventCommand.CREATE]: [EventCreateCommandPayload, ComponentMetadata],
    [EventCommand.CLEAN]: [EventCreateCommandPayload, ComponentMetadata],

    [EventEvent.CREATION_STARTED]: [EventCreateEventPayload, ComponentMetadata],
    [EventEvent.CREATION_FINISHED]: [Event, ComponentMetadata],
    [EventEvent.CREATION_FAILED]: [EventCreateFailedEventPayload, ComponentMetadata],
}>;
