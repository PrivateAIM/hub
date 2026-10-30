/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';

import type { Event } from '@privateaim/telemetry-kit';

/**
 * The only thing {@link EntityEventHandler} needs from the event component: a way
 * to publish one event record. Declared as a port rather than depending on the
 * concrete `EventComponentDispatcher` so the handler can be exercised without a
 * message bus — `EventComponentDispatcher` satisfies it structurally.
 */
export interface IEventPublisher {
    dispatchCreate(payload: Partial<Event>): Promise<unknown>;
}

export type EntityEventHandlerContext = {
    eventComponentDispatcher?: IEventPublisher,
    logger?: Logger,
};
