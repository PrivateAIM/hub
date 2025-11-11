/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
    QueueRouterComponentEmitter,
    isQueueRouterUsable,
    useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import {
    AnalysisDistributorCommand,
    AnalysisDistributorEventQueueRouterRouting,
    AnalysisDistributorTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorExecuteHandler } from './handlers';

export class AnalysisDistributorComponent extends BaseComponent {
    constructor() {
        super();

        this.mount(AnalysisDistributorCommand.EXECUTE, new AnalysisDistributorExecuteHandler());

        if (isQueueRouterUsable()) {
            this.mount('*', async (
                value,
                context,
            ) => {
                const emitter = new QueueRouterComponentEmitter();
                await emitter.emit(context.key, value, {
                    ...context.metadata,
                    routing: AnalysisDistributorEventQueueRouterRouting,
                });
            });
        }
    }

    async start() {
        await this.initialize();

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                AnalysisDistributorTaskQueueRouterRouting,
                async (
                    payload,
                ) => this.handle(
                    payload.type,
                    payload.data,
                    payload.metadata,
                ),
            );
        } else {
            useLogger().warn('Analysis distributor component can not consume tasks.');
        }
    }
}
