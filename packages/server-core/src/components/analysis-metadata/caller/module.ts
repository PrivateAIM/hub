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
import type { AnalysisMetadataTaskMap } from '../types';
import { AnalysisMetadataTaskQueue } from '../constants';

export class AnalysisMetadataComponentCaller implements ComponentCaller<AnalysisMetadataTaskMap> {
    protected directCaller : DirectComponentCaller<AnalysisMetadataTaskMap>;

    protected queueDispatchCaller : QueueDispatchComponentCaller<AnalysisMetadataTaskMap>;

    constructor() {
        this.directCaller = new DirectComponentCaller<AnalysisMetadataTaskMap>(useAnalysisMetadataComponent());
        this.queueDispatchCaller = new QueueDispatchComponentCaller<AnalysisMetadataTaskMap>();
    }

    async call<Key extends keyof AnalysisMetadataTaskMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataTaskMap[Key]>
    ): Promise<ComponentCallerResponse<AnalysisMetadataTaskMap>> {
        const [data, metadata] = payload;

        if (isQueueRouterUsable()) {
            return wait(500)
                .then(() => this.queueDispatchCaller.call(key, data, {
                    ...metadata,
                    routing: AnalysisMetadataTaskQueue,
                }));
        }

        return this.directCaller.call(key, data, metadata);
    }
}
