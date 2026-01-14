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
import { LogComponentWriteHandler } from './handlers/index.ts';

export class LogComponent extends BaseComponent {
    constructor() {
        super();

        this.mount(LogCommand.WRITE, new LogComponentWriteHandler());
    }

    async start() {
        await this.initialize();
    }
}
