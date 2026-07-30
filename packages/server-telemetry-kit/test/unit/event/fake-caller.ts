/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import type { IEventPublisher } from '../../../src/core';

/** Records what `EntityEventHandler` publishes, without a message bus. */
export class FakeEventPublisher implements IEventPublisher {
    public readonly created: Partial<Event>[] = [];

    async callCreate(payload: Partial<Event>): Promise<void> {
        this.created.push(payload);
    }

    get last(): Partial<Event> {
        return this.created[this.created.length - 1];
    }
}
