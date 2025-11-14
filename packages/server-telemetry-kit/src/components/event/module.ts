/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata } from '@privateaim/server-kit';
import {
    QueueDispatchComponentCaller,
} from '@privateaim/server-kit';
import type { EventCreateCommandPayload } from './handlers';
import { EventCommand, EventTaskQueueRouterRouting } from './constants';

export class EventComponentCaller extends QueueDispatchComponentCaller {
    constructor() {
        super({
            queue: EventTaskQueueRouterRouting,
            logging: false,
        });
    }

    async callCreate(payload: EventCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(EventCommand.CREATE, payload, metadata);
    }

    async callClean(payload: EventCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(EventCommand.CLEAN, payload, metadata);
    }
}
