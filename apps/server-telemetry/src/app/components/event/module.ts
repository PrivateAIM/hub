/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseComponent } from '@privateaim/server-kit';
import type { EventComponentEventMap } from '@privateaim/server-telemetry-kit';
import { EventCommand } from '@privateaim/server-telemetry-kit';
import { EventComponentCleanerHandler, EventComponentCreateHandler } from './handlers/index.ts';

export class EventComponent extends BaseComponent<EventComponentEventMap> {
    constructor() {
        super();

        this.mount(EventCommand.CREATE, new EventComponentCreateHandler());
        this.mount(EventCommand.CLEAN, new EventComponentCleanerHandler());
    }

    async start() {
        await this.initialize();
    }
}
