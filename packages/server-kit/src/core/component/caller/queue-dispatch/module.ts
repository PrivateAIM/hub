/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentEventMap } from '../../type';
import type { ComponentCaller, ComponentCallerPayload, ComponentCallerResponse } from '../types';
import type { QueueRouter, QueueRouterRouting } from '../../../queue-router';
import { buildQueueRouterPublishPayload, useQueueRouter } from '../../../queue-router';

export class QueueDispatchComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap, { routing: QueueRouterRouting}> {
    protected client : QueueRouter;

    constructor() {
        this.client = useQueueRouter();
    }

    async call<K extends keyof EventMap>(
        type: K & string,
        ...payload: ComponentCallerPayload<EventMap[K], {routing: QueueRouterRouting }>
    ): Promise<ComponentCallerResponse<EventMap>> {
        const [data, metadata] = payload;

        await this.client.publish(buildQueueRouterPublishPayload({
            type,
            data,
            metadata,
        }));

        return {};
    }
}
