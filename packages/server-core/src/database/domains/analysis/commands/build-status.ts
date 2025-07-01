/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { AnalysisAPICommand, isAnalysisAPICommandExecutable } from '@privateaim/core-kit';
import { BuilderCommand, buildBuilderTaskQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import { useQueueRouter } from '@privateaim/server-kit';
import type { AnalysisEntity } from '../entity';

export async function detectAnalysisBuildStatus(entity: AnalysisEntity) : Promise<AnalysisEntity> {
    const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STATUS);
    if (!check.success) {
        throw new BadRequestError(check.message);
    }

    const client = useQueueRouter();
    await client.publish(buildBuilderTaskQueueRouterPayload({
        command: BuilderCommand.CHECK,
        data: {
            id: entity.id,
        },
    }));

    return entity;
}
