/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentCaller,
    ComponentCallerPayload,
    ComponentCallerResponse,
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
    ): Promise<ComponentCallerResponse<AnalysisMetadataEventMap>> {
        const [data, metadata] = payload;

        if (isQueueRouterUsable()) {
            return this.callWithQueue(key, data, metadata);
        }

        return this.callDirect(key, data, metadata);
    }

    async callDirect<Key extends keyof AnalysisMetadataEventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataEventMap[Key]>
    ): Promise<ComponentCallerResponse<AnalysisMetadataEventMap>> {
        const [data, metadata] = payload;

        return this.directCaller.call(key, data, metadata);
    }

    async callWithQueue<Key extends keyof AnalysisMetadataEventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataEventMap[Key]>
    ): Promise<ComponentCallerResponse<AnalysisMetadataEventMap>> {
        const [data, metadata] = payload;

        return wait(500)
            .then(() => this.queueDispatchCaller.call(key, data, metadata));
    }
}
