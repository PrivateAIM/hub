/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName, wait } from '@privateaim/kit';
import {
    BaseComponent,
    QueueRouterComponentEmitter,
    buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '@privateaim/server-telemetry';
import type { ObjectLiteral } from 'rapiq';
import { AnalysisMetadataCommand, AnalysisMetadataTaskQueue } from './constants';
import { AnalysisMetadataRecalcHandler } from './handlers';

export class AnalysisMetadataComponent extends BaseComponent {
    constructor() {
        super();

        this.mount(AnalysisMetadataCommand.RECALC, new AnalysisMetadataRecalcHandler());

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
                AnalysisMetadataTaskQueue,
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

    async trigger(
        key: string,
        value?: ObjectLiteral,
        metadata: ObjectLiteral = {},
    ) {
        if (
            isQueueRouterUsable() &&
            useEnv('env') !== EnvironmentName.TEST
        ) {
            const payload = buildQueueRouterPublishPayload({
                type: key,
                data: value,
                metadata: {
                    routing: AnalysisMetadataTaskQueue,
                    ...metadata,
                },
            });

            const queueRouter = useQueueRouter();
            await wait(500)
                .then(() => queueRouter.publish(payload));
        } else {
            await this.handle(key, value, metadata);
        }
    }
}
