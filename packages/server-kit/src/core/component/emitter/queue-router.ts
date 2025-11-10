/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ToTuple } from '../../event-emitter';

import type { ComponentEvents } from '../type';
import type { ComponentSubscriber } from './types';
import type { QueueRouter } from '../../queue-router';
import { buildQueueRouterPublishPayload, useQueueRouter } from '../../queue-router';

export class QueueRouterComponentEmitter<
    EventMap extends ComponentEvents = ComponentEvents,
> implements ComponentSubscriber<EventMap> {
    protected client : QueueRouter;

    constructor() {
        this.client = useQueueRouter();
    }

    async emit<Key extends keyof EventMap>(
        type: Key,
        ...input: ToTuple<EventMap[Key]>
    ): Promise<void> {
        const [data, metadata] = input;
        const payload = buildQueueRouterPublishPayload({
            type: type as string,
            data,
            metadata,
        });

        await this.client.publish(payload);
    }
}
