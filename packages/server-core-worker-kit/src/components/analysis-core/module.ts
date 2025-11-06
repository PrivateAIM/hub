/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import type { ComponentWithTrigger } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { AnalysisCoreCommand, AnalysisCoreTaskQueueRouterRouting } from './constants';
import type { AnalysisCoreConfigurePayload, AnalysisCoreDestroyPayload } from './types';

export class AnalysisCoreBaseComponent implements ComponentWithTrigger {
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
                    routing: AnalysisCoreTaskQueueRouterRouting,
                    ...metadata,
                },
            });

            const queueRouter = useQueueRouter();
            await queueRouter.publish(payload);
        }
    }

    async triggerConfigure(payload: AnalysisCoreConfigurePayload) {
        return this.trigger(AnalysisCoreCommand.CONFIGURE, payload);
    }

    async triggerDestroy(payload: AnalysisCoreDestroyPayload) {
        return this.trigger(AnalysisCoreCommand.DESTROY, payload);
    }
}
