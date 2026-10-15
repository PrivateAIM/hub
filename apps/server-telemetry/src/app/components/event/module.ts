/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { Component } from 'ergos';
import type { EventComponentEventMap } from '@privateaim/server-telemetry-kit';
import { EventCommand } from '@privateaim/server-telemetry-kit';
import { EventComponentCreateHandler } from './handlers/index.ts';

export class EventComponent extends Component<EventComponentEventMap> {
    constructor(ctx: { logger?: Logger, retentionDays?: number }) {
        super();

        this.mount(EventCommand.CREATE, new EventComponentCreateHandler({ logger: ctx.logger, retentionDays: ctx.retentionDays }));
    }

    async start() {
        await this.initialize();
    }
}
