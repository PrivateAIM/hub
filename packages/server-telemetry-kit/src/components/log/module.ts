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
import { LogCommand, LogTaskQueueRouterRouting } from './constants';
import type { LogWriteCommandPayload } from './handlers';

export class LogComponentCaller extends QueueDispatchComponentCaller {
    constructor() {
        super({
            queue: LogTaskQueueRouterRouting,
            logging: false,
        });
    }

    async callWrite(payload: LogWriteCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(LogCommand.WRITE, payload, metadata);
    }
}
