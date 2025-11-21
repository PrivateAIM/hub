/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type { AnalysisDistributorBasePayload } from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import { AnalysisEntity, useDataSourceSync } from '../../../database';

export async function handleAnalysisDistributorEvent(
    value: AnalysisDistributorBasePayload,
    context: ComponentHandlerContext,
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
        case AnalysisDistributorEvent.EXECUTION_FAILED: {
            entity.distribution_status = ProcessStatus.FAILED;
            break;
        }
        case AnalysisDistributorEvent.EXECUTION_FINISHED: {
            entity.distribution_status = ProcessStatus.FINISHED;
        }
    }

    await repository.save(entity);
}
