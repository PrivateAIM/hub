/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import { LogCommand } from '@privateaim/server-telemetry-kit';
import type { LogStore } from '../../../core/services/log-store/types.ts';
import { MemoryLogStore } from '../../../adapters/telemetry/memory.ts';
import { LogComponentWriteHandler } from './handlers/index.ts';

export class LogComponent extends BaseComponent {
    constructor(ctx?: { logStore?: LogStore }) {
        super();

        const logStore = ctx?.logStore ?? new MemoryLogStore();
        this.mount(LogCommand.WRITE, new LogComponentWriteHandler(logStore));
    }

    async start() {
        await this.initialize();
    }
}
