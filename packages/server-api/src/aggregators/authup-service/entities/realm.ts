/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { RealmEventContext } from '@authup/core';
import { useDataSource } from 'typeorm-extension';
import {
    AnalysisEntity, NodeEntity, ProjectEntity, ProjectNodeEntity, RegistryProjectEntity,
} from '../../../domains';

export async function handleAuthupRealmEvent(context: RealmEventContext) {
    if (context.event === 'deleted') {
        const dataSource = await useDataSource();

        const projectRepository = dataSource.getRepository(ProjectEntity);
        const projects = await projectRepository.find({
            where: {
                realm_id: context.data.id,
            },
        });

        await projectRepository.remove(projects);

        const projectNodeRepository = dataSource.getRepository(ProjectNodeEntity);
        const projectNodes = await projectNodeRepository.createQueryBuilder()
            .where('project_realm_id = :realmId', { realmId: context.data.id })
            .orWhere('node_realm_id = :realmId', { realmId: context.data.id })
            .getMany();

        await projectNodeRepository.remove(projectNodes);

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

        const analysisFileRepository = dataSource.getRepository(AnalysisEntity);
        const analysisFiles = await analysisFileRepository.find({
            where: {
                realm_id: context.data.id,
            },
        });

        await analysisRepository.remove(analysisFiles);

        const analysisLogRepository = dataSource.getRepository(AnalysisEntity);
        const analysisLogs = await analysisLogRepository.find({
            where: {
                realm_id: context.data.id,
            },
        });

        await analysisLogRepository.remove(analysisLogs);

        const analyseNodeRepository = dataSource.getRepository(ProjectNodeEntity);
        const analyseNodes = await analyseNodeRepository.createQueryBuilder()
            .where('node_realm_id = :realmId', { realmId: context.data.id })
            .orWhere('project_realm_id = :realmId', { realmId: context.data.id })
            .getMany();

        await projectNodeRepository.remove(analyseNodes);
    }
}
