/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { BaseComponent } from '@privateaim/server-kit';
import type { EventComponentEventMap } from '@privateaim/server-telemetry-kit';
import { EventCommand } from '@privateaim/server-telemetry-kit';
import { EventComponentCleanerHandler, EventComponentCreateHandler } from './handlers/index.ts';

export class EventComponent extends BaseComponent<EventComponentEventMap> {
    constructor(ctx?: { logger?: Logger }) {
        super();

        this.mount(EventCommand.CREATE, new EventComponentCreateHandler({ logger: ctx?.logger }));
        this.mount(EventCommand.CLEAN, new EventComponentCleanerHandler({ logger: ctx?.logger }));
    }

    async start() {
        await this.initialize();
    }
}
