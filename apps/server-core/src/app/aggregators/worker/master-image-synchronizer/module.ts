/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import type { MasterImageSynchronizerEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageSynchronizerEvent,
} from '@privateaim/server-core-worker-kit';
import type { IEntityRepository, Logger } from '@privateaim/server-kit';
import type { IMasterImageRepository } from '../../../../core/entities/master-image/types.ts';
import { Component } from 'ergos';
import type { EventComponentCaller } from '@privateaim/server-telemetry-kit';
import {
    handleMasterImageSynchronizerExecutionFinishedEvent,
} from './handler.ts';

type MasterImageSynchronizerAggregatorContext = {
    imageRepository: IMasterImageRepository;
    groupRepository: IEntityRepository<MasterImageGroup>;
    eventComponentCaller?: EventComponentCaller;
    logger?: Logger;
};

export class MasterImageSynchronizerAggregator extends Component<MasterImageSynchronizerEventMap> {
    constructor(ctx: MasterImageSynchronizerAggregatorContext) {
        super();

        const recordEvent = async (name: string) => {
            if (ctx.eventComponentCaller) {
                await ctx.eventComponentCaller.callCreate({
                    name,
                    data: {},
                    refType: DomainType.MASTER_IMAGE,
                    scope: 'synchronizer',
                });
            }
        };

        // A specific handler shadows '*', so it records its own telemetry event.
        this.mount(MasterImageSynchronizerEvent.EXECUTION_FINISHED, async (value, context) => {
            await handleMasterImageSynchronizerExecutionFinishedEvent(
                value,
                ctx.imageRepository,
                ctx.groupRepository,
                ctx.logger,
            );
            await recordEvent(context.key);
        });
        this.mount('*', (_payload, context) => recordEvent(context.key));
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
