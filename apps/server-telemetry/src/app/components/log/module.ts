/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { Component } from 'hubwire';
import { LogCommand } from '@privateaim/server-telemetry-kit';
import type { LogStore } from '../../../core/services/log-store/types.ts';
import { MemoryLogStore } from '../../../adapters/telemetry/memory.ts';
import { LogComponentWriteHandler } from './handlers/index.ts';

export class LogComponent extends Component {
    constructor(ctx?: { logStore?: LogStore, logger?: Logger }) {
        super();

        const logStore = ctx?.logStore ?? new MemoryLogStore();

        this.mount(LogCommand.WRITE, new LogComponentWriteHandler(logStore, ctx?.logger));
    }

    async start() {
        await this.initialize();
    }
}
