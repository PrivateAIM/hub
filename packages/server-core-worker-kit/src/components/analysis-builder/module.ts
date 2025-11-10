/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import type { ComponentWithTrigger } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { AnalysisBuilderCommand, AnalysisBuilderTaskQueueRouterRouting } from './constants';
import type { AnalysisBuilderBasePayload, AnalysisBuilderExecutePayload } from './types';

export class AnalysisBuilderBaseComponent implements ComponentWithTrigger {
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
                    routing: AnalysisBuilderTaskQueueRouterRouting,
                    ...metadata,
                },
            });

            const queueRouter = useQueueRouter();
            await queueRouter.publish(payload);
        }
    }

    async triggerExecute(payload: AnalysisBuilderExecutePayload) {
        return this.trigger(AnalysisBuilderCommand.EXECUTE, payload);
    }

    async triggerCheck(payload: AnalysisBuilderBasePayload) {
        return this.trigger(AnalysisBuilderCommand.CHECK, payload);
    }
}
