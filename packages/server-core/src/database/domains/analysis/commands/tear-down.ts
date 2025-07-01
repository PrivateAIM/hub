/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CoreCommand, buildCoreTaskQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import type { AnalysisEntity } from '../entity';

export async function runAnalysisTearDownCommand(
    entity: AnalysisEntity,
) : Promise<AnalysisEntity> {
    if (!isQueueRouterUsable()) {
        useLogger().warn('The analysis command configure could not executed.');
        return entity;
    }

    const message = buildCoreTaskQueueRouterPayload({
        command: CoreCommand.DESTROY,
        data: {
            id: entity.id,
        },
    });

    const client = useQueueRouter();
    await client.publish(message);

    return entity;
}
