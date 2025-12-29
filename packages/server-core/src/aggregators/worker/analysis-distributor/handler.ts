/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisDistributorBasePayload,
    AnalysisDistributorCheckFinishedPayload,
    AnalysisDistributorEventMap,
} from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import { AnalysisEntity, useDataSourceSync } from '../../../database';

export async function handleAnalysisDistributorEvent(
    value: AnalysisDistributorBasePayload,
    context: ComponentHandlerContext<AnalysisDistributorEventMap>,
) {
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
        case AnalysisDistributorEvent.CHECK_FAILED:
        case AnalysisDistributorEvent.EXECUTION_FAILED: {
            entity.distribution_status = ProcessStatus.FAILED;
            break;
        }
        case AnalysisDistributorEvent.EXECUTION_FINISHED: {
            entity.distribution_status = ProcessStatus.FINISHED;
            break;
        }
        case AnalysisDistributorEvent.CHECK_FINISHED: {
            const temp = value as AnalysisDistributorCheckFinishedPayload;

            entity.distribution_status = temp.status || null;
        }
    }

    await repository.save(entity);
}
