/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentCallerPayload, ComponentCallerResponse } from '@privateaim/server-kit';
import { QueueDispatchComponentCaller } from '@privateaim/server-kit';
import { wait } from '@privateaim/kit';
import type { AnalysisMetadataTaskMap } from '../types';
import { AnalysisMetadataTaskQueue } from '../constants';

export class AnalysisMetadataComponentCaller extends QueueDispatchComponentCaller<AnalysisMetadataTaskMap> {
    async call<Key extends keyof AnalysisMetadataTaskMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<AnalysisMetadataTaskMap[Key]>
    ): Promise<ComponentCallerResponse<AnalysisMetadataTaskMap>> {
        const [data, metadata] = payload;
        return wait(500)
            .then(() => super.call(key, data, {
                ...metadata,
                routing: AnalysisMetadataTaskQueue,
            }));
    }
}
