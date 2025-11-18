/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentCaller,
    ComponentCallerPayload,
    ComponentDirectCallerResponse,
} from '@privateaim/server-kit';
import {
    DirectComponentCaller,
    QueueDispatchComponentCaller,
    isQueueRouterUsable,
} from '@privateaim/server-kit';
import { wait } from '@privateaim/kit';
import { useAnalysisMetadataComponent } from '../singleton';
import type { AnalysisMetadataEventMap } from '../types';
import { AnalysisMetadataTaskQueue } from '../constants';

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

        await wait(500);

        if (isQueueRouterUsable()) {
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

        return this.directCaller.callWithResponse(key, data, metadata);
    }

    async callWithQueue<Key extends keyof AnalysisMetadataEventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataEventMap[Key]>
    ): Promise<void> {
        const [data, metadata] = payload;

        return this.queueDispatchCaller.call(key, data, metadata);
    }
}
