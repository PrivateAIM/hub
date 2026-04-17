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
import type { EventComponentCaller } from '@privateaim/server-telemetry-kit';
import type { DataSource } from 'typeorm';
import {
    handleMasterImageBuilderEvent,
} from './handler.ts';

export class MasterImageBuilderAggregator extends BaseComponent<MasterImageBuilderEventMap> {
    constructor(ctx: { dataSource: DataSource; eventComponentCaller?: EventComponentCaller }) {
        super();

        const handler = (value, context) => handleMasterImageBuilderEvent(value, context, ctx.dataSource, ctx.eventComponentCaller);

        this.mount(MasterImageBuilderEvent.EXECUTION_PROGRESS, handler);
        this.mount(MasterImageBuilderEvent.EXECUTION_STARTED, handler);
        this.mount(MasterImageBuilderEvent.EXECUTION_FAILED, handler);
        this.mount(MasterImageBuilderEvent.EXECUTION_FINISHED, handler);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
