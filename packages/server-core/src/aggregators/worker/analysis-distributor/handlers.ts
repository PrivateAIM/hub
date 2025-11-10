/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type { AnalysisDistributorPayload } from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext, ComponentHandlersOptions } from '@privateaim/server-kit';
import { ComponentHandlers } from '@privateaim/server-kit';
import { AnalysisEntity, useDataSourceSync } from '../../../database';

export function defineAnalysisDistributorHandlers(
    options: ComponentHandlersOptions = {},
) {
    const manager = new ComponentHandlers(options);

    const handleEvent = async (
        value: AnalysisDistributorPayload,
        context: ComponentHandlerContext<`${AnalysisDistributorEvent}`>,
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
            case AnalysisDistributorEvent.EXECUTION_STARTED: {
                entity.distribution_status = ProcessStatus.STARTED;
                break;
            }
            case AnalysisDistributorEvent.EXECUTION_FAILED: {
                entity.distribution_status = ProcessStatus.FAILED;
                break;
            }
            case AnalysisDistributorEvent.EXECUTION_FINISHED: {
                entity.distribution_status = ProcessStatus.FINISHED;
            }
        }

        await repository.save(entity);
    };

    manager.mount(AnalysisDistributorEvent.EXECUTION_STARTED, handleEvent);
    manager.mount(AnalysisDistributorEvent.EXECUTION_FAILED, handleEvent);
    manager.mount(AnalysisDistributorEvent.EXECUTION_FINISHED, handleEvent);

    return manager;
}
