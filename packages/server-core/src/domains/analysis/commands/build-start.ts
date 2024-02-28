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
import { useAmqpClient } from '../../../core';
import { RegistryEntity } from '../../registry';
import { AnalysisNodeEntity } from '../../anaylsis-node';
import { AnalysisEntity } from '../entity';
import { resolveAnalysis } from './utils';

export async function startAnalysisBuild(
    train: AnalysisEntity | string,
) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    train = await resolveAnalysis(train, repository);

    if (train.run_status) {
        throw new BadRequestError('The train can not longer be build...');
    } else {
        const trainStationRepository = dataSource.getRepository(AnalysisNodeEntity);
        const trainStations = await trainStationRepository.findBy({
            analysis_id: train.id,
        });

        for (let i = 0; i < trainStations.length; i++) {
            if (trainStations[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED) {
                throw new BadRequestError('Not all stations have approved the train yet.');
            }
        }

        if (!train.registry_id) {
            const registryRepository = dataSource.getRepository(RegistryEntity);
            const registry = await registryRepository.findOne({});

            if (!registry) {
                throw new BadRequestError('No registry is registered.');
            }

            train.registry_id = registry.id;
        }

        const client = useAmqpClient();
        await client.publish(buildBuilderQueuePayload({
            command: BuilderCommand.BUILD,
            data: {
                id: train.id,
            },
        }));

        train.build_status = AnalysisBuildStatus.STARTING;

        await repository.save(train);
    }

    return train;
}
