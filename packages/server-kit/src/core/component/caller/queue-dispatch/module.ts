/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentEventMap } from '../../type';
import type { ComponentCaller, ComponentCallerPayload } from '../types';
import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '../../../queue-router';
import { useLogger } from '../../../../services';
import type { QueueDispatchComponentCallerOptions } from './types';

export class QueueDispatchComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap> {
    protected options : QueueDispatchComponentCallerOptions;

    constructor(options: QueueDispatchComponentCallerOptions) {
        this.options = options;
    }

    async call<K extends keyof EventMap>(
        type: K & string,
        ...payload: ComponentCallerPayload<EventMap[K]>
    ): Promise<void> {
        const [data, metadata] = payload;

        if (!isQueueRouterUsable()) {
            useLogger().warn(`Can not publish ${type} event.`);
            return;
        }

        const client = useQueueRouter();
        await client.publish(
            buildQueueRouterPublishPayload({
                type,
                data,
                metadata: {
                    ...metadata,
                    routing: this.options.queue,
                },
            }),
            {
                logging: this.options.logging ?? true,
            },
        );
    }
}
