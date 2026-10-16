/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import { LogCommand, LogTaskMessageBusRouting } from './constants';
import type { LogWriteCommandPayload } from './handlers';

export class LogComponentDispatcher extends RemoteDispatcher {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({
            ...options,
            routing: LogTaskMessageBusRouting,
        });
    }

    async dispatchWrite(payload: LogWriteCommandPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(LogCommand.WRITE, payload, metadata);
    }
}
