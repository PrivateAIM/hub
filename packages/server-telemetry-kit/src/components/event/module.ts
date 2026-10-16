/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import type { EventCreateCommandPayload } from './handlers';
import { EventCommand, EventTaskMessageBusRouting } from './constants';

export class EventComponentDispatcher extends RemoteDispatcher {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({
            ...options,
            routing: EventTaskMessageBusRouting,
        });
    }

    async dispatchCreate(payload: EventCreateCommandPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(EventCommand.CREATE, payload, metadata);
    }
}
