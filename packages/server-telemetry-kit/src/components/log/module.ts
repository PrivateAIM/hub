/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, DispatchCallerOptions } from 'synergos';
import { DispatchCaller } from 'synergos';
import { LogCommand, LogTaskMessageBusRouting } from './constants';
import type { LogWriteCommandPayload } from './handlers';

export class LogComponentCaller extends DispatchCaller {
    constructor(options: Omit<DispatchCallerOptions, 'routing'>) {
        super({
            ...options,
            routing: LogTaskMessageBusRouting,
        });
    }

    async callWrite(payload: LogWriteCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(LogCommand.WRITE, payload, metadata);
    }
}
