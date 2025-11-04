/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentEmitter } from './types';
import type { QueueRouter, QueueRouterPayloadMetadataInput } from '../../queue-router';
import { buildQueueRouterPublishPayload, useQueueRouter } from '../../queue-router';
import type { ObjectLiteral } from '../../../type';

export class QueueRouterComponentEmitter implements ComponentEmitter {
    protected client : QueueRouter;

    constructor() {
        this.client = useQueueRouter();
    }

    async emit(
        type: string,
        data: ObjectLiteral,
        metadata: QueueRouterPayloadMetadataInput,
    ): Promise<void> {
        const payload = buildQueueRouterPublishPayload({
            type,
            data,
            metadata,
        });

        await this.client.publish(payload);
    }
}
