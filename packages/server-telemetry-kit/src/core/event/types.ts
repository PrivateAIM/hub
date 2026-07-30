/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';

/**
 * The only thing {@link EntityEventHandler} needs from the event component: a way
 * to publish one event record. Declared as a port rather than depending on the
 * concrete `EventComponentCaller` so the handler can be exercised without a
 * message bus — `EventComponentCaller` satisfies it structurally.
 */
export interface IEventPublisher {
    callCreate(payload: Partial<Event>): Promise<unknown>;
}
