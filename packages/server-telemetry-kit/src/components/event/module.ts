/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, DispatchCallerOptions } from 'synergos';
import { DispatchCaller } from 'synergos';
import type { EventCreateCommandPayload } from './handlers';
import { EventCommand, EventTaskMessageBusRouting } from './constants';

export class EventComponentCaller extends DispatchCaller {
    constructor(options: Omit<DispatchCallerOptions, 'routing'>) {
        super({
            ...options,
            routing: EventTaskMessageBusRouting,
        });
    }

    async callCreate(payload: EventCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(EventCommand.CREATE, payload, metadata);
    }
}
