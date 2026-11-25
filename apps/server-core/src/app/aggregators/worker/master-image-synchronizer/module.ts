/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { MasterImageSynchronizerEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageSynchronizerEvent,
} from '@privateaim/server-core-worker-kit';
import { Component } from 'hubwire';
import { extractPayloadErrorMessage } from '../helpers.ts';
import {
    handleMasterImageSynchronizerExecutionFinishedEvent,
} from './handler.ts';
import type { MasterImageSynchronizerAggregatorContext } from './types.ts';

export class MasterImageSynchronizerAggregator extends Component<MasterImageSynchronizerEventMap> {
    constructor(ctx: MasterImageSynchronizerAggregatorContext) {
        super();

        const recordEvent = async (name: string, payload?: unknown) => {
            if (!ctx.eventComponentDispatcher) {
                return;
            }

            const error = extractPayloadErrorMessage(payload);

            await ctx.eventComponentDispatcher.dispatchCreate({
                name,
                data: error ? { error } : {},
                refType: DomainType.MASTER_IMAGE,
                scope: 'synchronizer',
            });
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
        this.mount('*', (payload, context) => recordEvent(context.key, payload));
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
