/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import {
    AnalysisBuilderBaseComponent,
    AnalysisBuilderTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import type {
    Component,
    ComponentHandlers,
} from '@privateaim/server-kit';
import {
    ComponentVoidEmitter,
    QueueRouterComponentEmitter,
    isQueueRouterUsable,
    useQueueRouter,
} from '@privateaim/server-kit';

import { defineAnalysisBuilderHandlers } from './handlers';

export class AnalysisBuilderComponent extends AnalysisBuilderBaseComponent implements Component {
    protected handlers: ComponentHandlers;

    constructor() {
        super();

        this.handlers = defineAnalysisBuilderHandlers({
            emitter: isQueueRouterUsable() ?
                new QueueRouterComponentEmitter() :
                new ComponentVoidEmitter(),
        });
    }

    async start() {
        await this.handlers.initialize();

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                AnalysisBuilderTaskQueueRouterRouting,
                async (
                    payload,
                ) => this.handlers.execute(
                    payload.type,
                    payload.data,
                    payload.metadata,
                ),
            );
        }
    }

    async trigger(
        key: string,
        value: ObjectLiteral = {},
        metadata: ObjectLiteral = {},
    ): Promise<void> {
        await this.handlers.execute(
            key,
            value,
            metadata,
        );
    }
}
