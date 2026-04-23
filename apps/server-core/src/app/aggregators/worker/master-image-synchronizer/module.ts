/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import type { MasterImageSynchronizerEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageSynchronizerEvent,
} from '@privateaim/server-core-worker-kit';
import type { IEntityRepository, Logger } from '@privateaim/server-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';
import type { EventComponentCaller } from '@privateaim/server-telemetry-kit';
import {
    handleMasterImageSynchronizerExecutionFinishedEvent,
} from './handler.ts';

type MasterImageSynchronizerAggregatorContext = {
    imageRepository: IEntityRepository<MasterImage>;
    groupRepository: IEntityRepository<MasterImageGroup>;
    eventComponentCaller?: EventComponentCaller;
    logger?: Logger;
};

export class MasterImageSynchronizerAggregator extends BaseComponent<MasterImageSynchronizerEventMap> {
    constructor(ctx: MasterImageSynchronizerAggregatorContext) {
        super();

        const handler = (value) => handleMasterImageSynchronizerExecutionFinishedEvent(
            value,
            ctx.imageRepository,
            ctx.groupRepository,
            ctx.logger,
        );
        this.mount(MasterImageSynchronizerEvent.EXECUTION_FINISHED, handler);
        this.mount('*', async (
            _payload,
            context,
        ) => {
            if (ctx.eventComponentCaller) {
                await ctx.eventComponentCaller.callCreate({
                    name: context.key,
                    data: {},
                    ref_type: DomainType.MASTER_IMAGE,
                    scope: 'synchronizer',
                    expiring: true,
                    expires_at: new Date(
                        Date.now() + (1000 * 60 * 60 * 24),
                    ).toISOString(),
                });
            }
        });
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
