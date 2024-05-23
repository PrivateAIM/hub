/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuilderCommand, buildBuilderQueuePayload } from '@privateaim/server-analysis-manager-kit';
import { useDataSource } from 'typeorm-extension';
import { useAmqpClient } from '@privateaim/server-kit';
import { resolveAnalysis } from './utils';
import { AnalysisEntity } from '../entity';

export async function detectAnalysisBuildStatus(train: AnalysisEntity | string) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    train = await resolveAnalysis(train, repository);

    const client = useAmqpClient();
    await client.publish(buildBuilderQueuePayload({
        command: BuilderCommand.CHECK,
        data: {
            id: train.id,
        },
    }));

    return train;
}
