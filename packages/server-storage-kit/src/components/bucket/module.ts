/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import type { ComponentWithTrigger } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import {
    BucketCommand,
    BucketTaskQueueRouterRouting,
} from './constants';
import type { BucketCreateCommandPayload, BucketDeleteCommandPayload } from './handlers';

export class BucketBaseComponent implements ComponentWithTrigger {
    async trigger(
        key: string,
        value: ObjectLiteral = {},
        metadata: ObjectLiteral = {},
    ): Promise<void> {
        if (isQueueRouterUsable()) {
            const payload = buildQueueRouterPublishPayload({
                type: key,
                data: value,
                metadata: {
                    routing: BucketTaskQueueRouterRouting,
                    ...metadata,
                },
            });

            const queueRouter = useQueueRouter();
            await queueRouter.publish(payload);
        }
    }

    async triggerCreate(payload: BucketCreateCommandPayload, metadata: ObjectLiteral = {}) {
        return this.trigger(BucketCommand.CREATE, payload, metadata);
    }

    async triggerDelete(payload: BucketDeleteCommandPayload, metadata: ObjectLiteral = {}) {
        return this.trigger(BucketCommand.DELETE, payload, metadata);
    }
}
