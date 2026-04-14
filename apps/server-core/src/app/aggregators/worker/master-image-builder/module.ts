/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageBuilderEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';
import {
    handleMasterImageBuilderEvent,
} from './handler.ts';

export class MasterImageBuilderAggregator extends BaseComponent<MasterImageBuilderEventMap> {
    constructor() {
        super();

        this.mount(MasterImageBuilderEvent.EXECUTION_PROGRESS, handleMasterImageBuilderEvent);
        this.mount(MasterImageBuilderEvent.EXECUTION_STARTED, handleMasterImageBuilderEvent);
        this.mount(MasterImageBuilderEvent.EXECUTION_FAILED, handleMasterImageBuilderEvent);
        this.mount(MasterImageBuilderEvent.EXECUTION_FINISHED, handleMasterImageBuilderEvent);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
