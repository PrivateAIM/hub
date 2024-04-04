/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { AnalysisNode } from '@privateaim/core';
import { AnalysisFileType, AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core';
import { useDataSource } from 'typeorm-extension';
import { AnalysisFileEntity } from '../../analysis-file';
import { AnalysisNodeEntity } from '../../anaylsis-node';
import { AnalysisEntity } from '../entity';

export async function lockAnalysisConfiguration(entity: AnalysisEntity) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    if (!entity.master_image_id) {
        throw new BadRequestError('A master image must be assigned to the analysis.');
    }

    const analysisFileRepository = dataSource.getRepository(AnalysisFileEntity);
    const analysisFile = await analysisFileRepository.findOneBy({
        type: AnalysisFileType.CODE,
        root: true,
        analysis_id: entity.id,
    });
    if (!analysisFile) {
        throw new BadRequestError('At least one code file must be uploaded and at least one entrypoint file is required.');
    }

    const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
    const analysisNodes = await analysisNodeRepository.findBy({
        analysis_id: entity.id,
    });

    let aggregatorNode : AnalysisNode | undefined;

    for (let i = 0; i < analysisNodes.length; i++) {
        if (analysisNodes[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED) {
            throw new BadRequestError('At least one node has not approved the analysis.');
        }

        if (
            analysisNodes[i].node &&
            analysisNodes[i].node.type === NodeType.AGGREGATOR
        ) {
            aggregatorNode = analysisNodes[i];
        }
    }

    if (!aggregatorNode) {
        throw new BadRequestError('At least one aggregator node has to be part of the analysis.');
    }

    entity.configuration_locked = true;
    await repository.save(entity);

    return entity;
}
