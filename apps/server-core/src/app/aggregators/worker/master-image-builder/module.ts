/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { MasterImageBuilderEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import { Component } from 'ergos';
import type { MasterImageBuilderAggregatorContext } from './types.ts';

export class MasterImageBuilderAggregator extends Component<MasterImageBuilderEventMap> {
    constructor(ctx: MasterImageBuilderAggregatorContext) {
        super();

        const handler = async (value, context) => {
            const saved = await ctx.service.applyEvent(context.key, value);
            if (!saved) {
                return;
            }

            if (ctx.eventComponentCaller) {
                await ctx.eventComponentCaller.callCreate({
                    name: context.key,
                    data: {},
                    refType: DomainType.MASTER_IMAGE,
                    refId: saved.id,
                    scope: 'builder',
                });
            }
        };

        this.mount(MasterImageBuilderEvent.EXECUTION_PROGRESS, handler);
        this.mount(MasterImageBuilderEvent.EXECUTION_STARTED, handler);
        this.mount(MasterImageBuilderEvent.EXECUTION_FAILED, handler);
        this.mount(MasterImageBuilderEvent.EXECUTION_FINISHED, handler);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
