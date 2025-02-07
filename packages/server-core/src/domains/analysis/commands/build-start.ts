/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import {
    AnalysisAPICommand, AnalysisBuildStatus,
    AnalysisNodeApprovalStatus, isAnalysisAPICommandExecutable,
} from '@privateaim/core-kit';
import { BuilderCommand, buildBuilderTaskQueueRouterPayload } from '@privateaim/server-analysis-manager-kit';
import { useDataSource } from 'typeorm-extension';
import { useQueueRouter } from '@privateaim/server-kit';
import { RegistryEntity } from '../../registry';
import { AnalysisNodeEntity } from '../../anaylsis-node';
import { AnalysisEntity } from '../entity';

export async function startAnalysisBuild(
    entity: AnalysisEntity,
) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_START);
    if (!check.success) {
        throw new BadRequestError(check.message);
    }

    const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
    const analysisNodes = await analysisNodeRepository.find({
        where: {
            analysis_id: entity.id,
        },
        relations: ['node'],
    });

    for (let i = 0; i < analysisNodes.length; i++) {
        if (analysisNodes[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED) {
            throw new BadRequestError('Not all nodes have approved the analysis yet.');
        }

        if (
            analysisNodes[i].node &&
            !analysisNodes[i].node.registry_id
        ) {
            throw new BadRequestError(`The node ${analysisNodes[i].node.name} is not assigned to a registry yet.`);
        }
    }

    if (!entity.registry_id) {
        const registryRepository = dataSource.getRepository(RegistryEntity);
        const [registry] = await registryRepository.find({
            take: 1,
        });

        if (!registry) {
            throw new BadRequestError('No registry is registered.');
        }

        entity.registry_id = registry.id;
    }

    entity.build_status = AnalysisBuildStatus.STARTING;

    await repository.save(entity);

    const client = useQueueRouter();
    await client.publish(buildBuilderTaskQueueRouterPayload({
        command: BuilderCommand.BUILD,
        data: {
            id: entity.id,
        },
    }));

    return entity;
}
