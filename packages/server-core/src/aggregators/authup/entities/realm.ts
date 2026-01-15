/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    EntityType, EventRecord, Realm,
} from '@authup/core-kit';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '@privateaim/server-kit';
import {
    AnalysisEntity,
    NodeEntity,
    ProjectEntity,
    RegistryProjectEntity,
} from '../../../database/domains/index.ts';

export async function handleAuthupRealmEvent(context: EventRecord<EntityType.REALM, Realm>) {
    if (!context.data.id) {
        useLogger().warn('ID in authup realm event handler is missing.');
        return;
    }

    if (context.event === 'deleted') {
        const dataSource = await useDataSource();

        const projectRepository = dataSource.getRepository(ProjectEntity);
        const projects = await projectRepository.find({
            where: {
                realm_id: context.data.id,
            },
        });

        await projectRepository.remove(projects);

        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
        const registryProjects = await registryProjectRepository.find({
            where: {
                realm_id: context.data.id,
            },
        });

        await registryProjectRepository.remove(registryProjects);

        const nodeRepository = dataSource.getRepository(NodeEntity);
        const nodes = await nodeRepository.find({
            where: {
                realm_id: context.data.id,
            },
        });

        await nodeRepository.remove(nodes);

        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analyses = await analysisRepository.find({
            where: {
                realm_id: context.data.id,
            },
        });

        await analysisRepository.remove(analyses);
    }
}
