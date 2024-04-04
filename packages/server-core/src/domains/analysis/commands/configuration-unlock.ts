/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NodeType } from '@privateaim/core';
import { useDataSource } from 'typeorm-extension';
import { useEnv } from '../../../config';
import { AnalysisNodeEntity } from '../../anaylsis-node';
import { AnalysisEntity } from '../entity';

export async function unlockAnalysisConfiguration(entity: AnalysisEntity) : Promise<AnalysisEntity> {
    if (!entity.configuration_locked) {
        return entity;
    }

    const skipAnalysisApproval = useEnv('skipAnalysisApproval');
    if (skipAnalysisApproval) {
        return entity;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
    const analysisNodes = await analysisNodeRepository.find({
        where: {
            analysis_id: entity.id,
        },
        relations: ['node'],
    });

    for (let i = 0; i < analysisNodes.length; i++) {
        if (
            analysisNodes[i].node &&
            analysisNodes[i].node.type === NodeType.AGGREGATOR
        ) {
            continue;
        }

        analysisNodes[i].approval_status = null;

        await analysisNodeRepository.save(analysisNodes[i]);
    }

    entity.configuration_locked = false;
    await repository.save(entity);

    return entity;
}
