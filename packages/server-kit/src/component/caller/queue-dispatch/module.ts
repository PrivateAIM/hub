/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '../../../logger';
import type { QueueRouter } from '../../../queue-router';
import { buildQueueRouterPublishPayload } from '../../../queue-router';
import type { ComponentEventMap } from '../../type';
import type { ComponentCaller, ComponentCallerPayload } from '../types';
import type { QueueDispatchComponentCallerOptions } from './types';

export class QueueDispatchComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap> {
    protected options : QueueDispatchComponentCallerOptions;

    protected queueRouter?: QueueRouter;

    protected logger?: Logger;

    constructor(options: QueueDispatchComponentCallerOptions) {
        this.options = options;
        this.queueRouter = options.queueRouter;
        this.logger = options.logger;
    }

    async call<K extends keyof EventMap>(
        type: K & string,
        ...payload: ComponentCallerPayload<EventMap[K]>
    ): Promise<void> {
        const [data, metadata] = payload;

        if (!this.queueRouter) {
            if (this.logger) {
                this.logger.warn(`Can not publish ${type} event.`);
            }
            return;
        }

        await this.queueRouter.publish(
            buildQueueRouterPublishPayload({
                type,
                data,
                metadata: {
                    ...metadata,
                    routing: this.options.queue,
                },
            }),
            { logging: this.options.logging ?? true },
        );
    }
}
