/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, MessageBusDispatchComponentCallerOptions } from 'ergos';
import { MessageBusDispatchComponentCaller } from 'ergos';
import type { EventCreateCommandPayload } from './handlers';
import { EventCommand, EventTaskMessageBusRouting } from './constants';

export class EventComponentCaller extends MessageBusDispatchComponentCaller {
    constructor(options: Partial<MessageBusDispatchComponentCallerOptions> = {}) {
        super({
            ...options,
            routing: EventTaskMessageBusRouting,
            logging: false,
        });
    }

    async callCreate(payload: EventCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(EventCommand.CREATE, payload, metadata);
    }
}
