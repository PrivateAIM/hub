/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import {
    AnalysisBuildStatus,
    AnalysisNodeApprovalStatus,
} from '@privateaim/core';
import { BuilderCommand, buildBuilderQueuePayload } from '@privateaim/server-analysis-manager';
import { useDataSource } from 'typeorm-extension';
import { useAmqpClient } from '@privateaim/server-kit';
import { RegistryEntity } from '../../registry';
import { AnalysisNodeEntity } from '../../anaylsis-node';
import { AnalysisEntity } from '../entity';

export async function startAnalysisBuild(
    entity: AnalysisEntity,
) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    if (!entity.configuration_locked) {
        throw new BadRequestError('The configuration must be locked, to build the analysis.');
    }

    if (entity.run_status) {
        throw new BadRequestError('The analysis can not longer be build.');
    }

    const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
    const trainStations = await analysisNodeRepository.find({
        where: {
            analysis_id: entity.id,
        },
    });

    for (let i = 0; i < trainStations.length; i++) {
        if (trainStations[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED) {
            throw new BadRequestError('Not all nodes have approved the analysis yet.');
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

    const client = useAmqpClient();
    await client.publish(buildBuilderQueuePayload({
        command: BuilderCommand.BUILD,
        data: {
            id: entity.id,
        },
    }));

    entity.build_status = AnalysisBuildStatus.STARTING;

    await repository.save(entity);

    return entity;
}
