/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentCaller,
    ComponentCallerPayload,
    ComponentDirectCallerResponse, ComponentMetadata,
} from '@privateaim/server-kit';
import {
    DirectComponentCaller,
    QueueDispatchComponentCaller,
    isQueueRouterUsable,
} from '@privateaim/server-kit';
import { wait } from '@privateaim/kit';
import { AnalysisError } from '@privateaim/core-kit';
import { useAnalysisMetadataComponent } from '../singleton.ts';
import type { AnalysisMetadataEventMap, AnalysisMetadataRecalcPayload } from '../types.ts';
import { AnalysisMetadataCommand, AnalysisMetadataEvent, AnalysisMetadataTaskQueue } from '../constants.ts';
import type { AnalysisEntity } from '../../../database/index.ts';

export class AnalysisMetadataComponentCaller implements ComponentCaller<AnalysisMetadataEventMap> {
    protected directCaller : DirectComponentCaller<AnalysisMetadataEventMap>;

    protected queueDispatchCaller : QueueDispatchComponentCaller<AnalysisMetadataEventMap>;

    constructor() {
        this.directCaller = new DirectComponentCaller<AnalysisMetadataEventMap>(useAnalysisMetadataComponent());
        this.queueDispatchCaller = new QueueDispatchComponentCaller<AnalysisMetadataEventMap>({
            queue: AnalysisMetadataTaskQueue,
        });
    }

    async call<Key extends keyof AnalysisMetadataEventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataEventMap[Key]>
    ): Promise<void> {
        const [data, metadata] = payload;

        if (isQueueRouterUsable()) {
            await wait(500);
            await this.callWithQueue(key, data, metadata);
            return;
        }

        await this.callDirect(key, data, metadata);
    }

    async callDirect<Key extends keyof AnalysisMetadataEventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataEventMap[Key]>
    ): Promise<ComponentDirectCallerResponse<AnalysisMetadataEventMap>> {
        const [data, metadata] = payload;

        return this.directCaller.callAndWait(key, data, metadata);
    }

    async callWithQueue<Key extends keyof AnalysisMetadataEventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataEventMap[Key]>
    ): Promise<void> {
        const [data, metadata] = payload;

        return this.queueDispatchCaller.call(key, data, metadata);
    }

    async callRecalcDirect(
        payload: AnalysisMetadataRecalcPayload,
        metadata: ComponentMetadata = {},
    ) : Promise<AnalysisEntity> {
        const {
            [AnalysisMetadataEvent.RECALC_FINISHED]: entity,
        } = await this.callDirect(
            AnalysisMetadataCommand.RECALC,
            payload,
            metadata,
        );

        if (entity) {
            return entity;
        }

        throw AnalysisError.notFound();
    }
}
