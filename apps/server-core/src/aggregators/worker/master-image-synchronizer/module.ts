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
import {
    BaseComponent,
} from '@privateaim/server-kit';
import { isEventComponentCallerUsable, useEventComponentCaller } from '@privateaim/server-telemetry-kit';
import {
    handleMasterImageSynchronizerExecutionFinishedEvent,
} from './handler.ts';

export class MasterImageSynchronizerAggregator extends BaseComponent<MasterImageSynchronizerEventMap> {
    constructor() {
        super();

        this.mount(MasterImageSynchronizerEvent.EXECUTION_FINISHED, handleMasterImageSynchronizerExecutionFinishedEvent);
        this.mount('*', async (
            _payload,
            context,
        ) => {
            if (isEventComponentCallerUsable()) {
                const eventCaller = useEventComponentCaller();
                await eventCaller.callCreate({
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
