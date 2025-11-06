/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import type { ComponentWithTrigger } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { AnalysisDistributorCommand, AnalysisDistributorTaskQueueRouterRouting } from './constants';
import type { AnalysisDistributorExecutePayload } from './types';

export class AnalysisDistributorBaseComponent implements ComponentWithTrigger {
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
                    routing: AnalysisDistributorTaskQueueRouterRouting,
                    ...metadata,
                },
            });

            const queueRouter = useQueueRouter();
            await queueRouter.publish(payload);
        }
    }

    async triggerExecute(payload: AnalysisDistributorExecutePayload) {
        return this.trigger(AnalysisDistributorCommand.EXECUTE, payload);
    }
}
