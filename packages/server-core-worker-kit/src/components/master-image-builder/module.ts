/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata } from '@privateaim/server-kit';
import {
    QueueDispatchComponentCaller,
} from '@privateaim/server-kit';
import { MasterImageBuilderCommand, MasterImageBuilderTaskQueueRouterRouting } from './constants';
import type { MasterImageBuilderExecutePayload } from './types';

export class MasterImageBuilderComponentCaller extends QueueDispatchComponentCaller {
    constructor() {
        super({
            queue: MasterImageBuilderTaskQueueRouterRouting,
        });
    }

    async callExecute(payload: MasterImageBuilderExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(MasterImageBuilderCommand.EXECUTE, payload, metadata);
    }
}
