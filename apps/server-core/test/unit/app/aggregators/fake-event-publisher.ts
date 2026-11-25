/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IEventPublisher } from '@privateaim/server-telemetry-kit';
import type { Event } from '@privateaim/telemetry-kit';

export class FakeEventPublisher implements IEventPublisher {
    readonly events: Partial<Event>[] = [];

    async dispatchCreate(payload: Partial<Event>): Promise<void> {
        this.events.push(payload);
    }
}
