/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type { AnalysisBuilderBasePayload } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext, ComponentHandlersOptions } from '@privateaim/server-kit';
import { ComponentHandlers } from '@privateaim/server-kit';
import { AnalysisEntity, useDataSourceSync } from '../../../database';

export function defineAnalysisBuilderHandlers(
    options: ComponentHandlersOptions = {},
) {
    const manager = new ComponentHandlers(options);

    const handleEvent = async (
        value: AnalysisBuilderBasePayload,
        context: ComponentHandlerContext<`${AnalysisBuilderEvent}`>,
    ) => {
        const dataSource = useDataSourceSync();
        const repository = dataSource.getRepository(AnalysisEntity);

        const entity = await repository.findOneBy({
            id: value.id,
        });

        if (!entity) {
            return;
        }

        switch (context.key) {
            case AnalysisBuilderEvent.EXECUTION_STARTED: {
                entity.build_status = ProcessStatus.STARTED;
                break;
            }
            case AnalysisBuilderEvent.EXECUTION_FAILED: {
                entity.build_status = ProcessStatus.FAILED;
                break;
            }
            case AnalysisBuilderEvent.EXECUTION_FINISHED: {
                entity.build_status = ProcessStatus.FINISHED;
            }
        }

        await repository.save(entity);
    };

    manager.mount(AnalysisBuilderEvent.EXECUTION_STARTED, handleEvent);
    manager.mount(AnalysisBuilderEvent.EXECUTION_FAILED, handleEvent);
    manager.mount(AnalysisBuilderEvent.EXECUTION_FINISHED, handleEvent);

    return manager;
}
