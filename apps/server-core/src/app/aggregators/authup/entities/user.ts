/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { EntityType, EventRecord, User } from '@authup/core-kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity, ProjectEntity } from '../../../../adapters/database/index.ts';

export async function handleAuthupUserEvent(context: EventRecord<EntityType.USER, User>) {
    if (!context.data.id) {
        return;
    }

    if (context.event === 'deleted') {
        const dataSource = await useDataSource();

        const projectRepository = dataSource.getRepository(ProjectEntity);
        const projects = await projectRepository.find({ where: { user_id: context.data.id } });

        for (const project of projects) {
            project.user_id = null;
        }

        await projectRepository.save(projects);

        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analyses = await analysisRepository.find({ where: { user_id: context.data.id } });

        for (const analysis of analyses) {
            analysis.user_id = null;
        }

        await analysisRepository.save(analyses);

        const analysisFileRepository = dataSource.getRepository(AnalysisEntity);
        const analysisFiles = await analysisFileRepository.find({ where: { user_id: context.data.id } });

        await analysisRepository.remove(analysisFiles);
    }
}
