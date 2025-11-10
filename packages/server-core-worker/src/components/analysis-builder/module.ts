/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBuilderCommand,
    AnalysisBuilderTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
    QueueRouterComponentEmitter,
    isQueueRouterUsable,
    useQueueRouter,
} from '@privateaim/server-kit';

import { AnalysisBuilderCheckHandler, AnalysisBuilderExecuteHandler } from './handlers';

export class AnalysisBuilderComponent extends BaseComponent {
    constructor() {
        super();

        this.mount(AnalysisBuilderCommand.CHECK, new AnalysisBuilderCheckHandler());
        this.mount(AnalysisBuilderCommand.EXECUTE, new AnalysisBuilderExecuteHandler());

        if (isQueueRouterUsable()) {
            this.on('*', async (type, payload) => {
                const [data, metadata] = payload;
                const emitter = new QueueRouterComponentEmitter();
                await emitter.emit(type, data, metadata);
            });
        }
    }

    async start() {
        await this.initialize();

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                AnalysisBuilderTaskQueueRouterRouting,
                async (
                    payload,
                ) => this.handle(
                    payload.type,
                    payload.data,
                    payload.metadata,
                ),
            );
        }
    }
}
