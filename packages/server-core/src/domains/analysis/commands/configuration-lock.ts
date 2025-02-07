/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import {
    AnalysisAPICommand,
    AnalysisBucketType,
    AnalysisNodeApprovalStatus,
    NodeType,
    isAnalysisAPICommandExecutable,
} from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisBucketEntity } from '../../analysis-bucket';
import { AnalysisBucketFileEntity } from '../../analysis-bucket-file';
import { AnalysisNodeEntity } from '../../anaylsis-node';
import { AnalysisEntity } from '../entity';

export async function lockAnalysisConfiguration(entity: AnalysisEntity) : Promise<AnalysisEntity> {
    const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.CONFIGURATION_LOCK);
    if (!check.success) {
        throw new BadRequestError(check.message);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
    const analysisBucket = await analysisBucketRepository.findOneBy({
        type: AnalysisBucketType.CODE,
        analysis_id: entity.id,
    });
    if (!analysisBucket) {
        throw new BadRequestError('The analysis bucket for code files does not exist.');
    }

    const analysisFileRepository = dataSource.getRepository(AnalysisBucketFileEntity);
    const analysisFile = await analysisFileRepository.findOneBy({
        root: true,
        bucket_id: analysisBucket.id,
    });
    if (!analysisFile) {
        throw new BadRequestError('At least one code file must be uploaded and at least one entrypoint file is required.');
    }

    const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
    const analysisNodes = await analysisNodeRepository.find({
        where: {
            analysis_id: entity.id,
        },
        relations: ['node'],
    });

    let aggregatorNodes = 0;

    for (let i = 0; i < analysisNodes.length; i++) {
        if (analysisNodes[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED) {
            throw new BadRequestError('At least one node has not approved the analysis.');
        }

        if (
            analysisNodes[i].node &&
            analysisNodes[i].node.type === NodeType.AGGREGATOR
        ) {
            aggregatorNodes++;
        }
    }

    if (aggregatorNodes > 1) {
        throw new BadRequestError('Only one aggregator node can be part of the analysis.');
    }

    if (aggregatorNodes === 0) {
        throw new BadRequestError('At least one aggregator node has to be part of the analysis.');
    }

    entity.configuration_locked = true;
    await repository.save(entity);

    return entity;
}
