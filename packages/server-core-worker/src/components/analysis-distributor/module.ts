/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import type { Component, Component } from '@privateaim/server-kit';
import {
    ComponentVoidEmitter,
    QueueRouterComponentEmitter,
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import {
    AnalysisDistributorBaseComponent,
    AnalysisDistributorTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import { defineAnalysisDistributorHandlers } from './handlers';

export class AnalysisDistributorComponent extends AnalysisDistributorBaseComponent implements Component {
    protected handlers : Component;

    constructor() {
        super();

        this.handlers = defineAnalysisDistributorHandlers({
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
                AnalysisDistributorTaskQueueRouterRouting,
                async (
                    payload,
                ) => this.trigger(
                    payload.type,
                    payload.data,
                    payload.metadata,
                ),
            );
        } else {
            useLogger().warn('Analysis distributor component can not consume tasks.');
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
