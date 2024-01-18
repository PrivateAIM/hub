/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { UserEventContext } from '@authup/core';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity, ProjectEntity } from '../../../domains';

export async function handleAuthupUserEvent(context: UserEventContext) {
    if (context.event === 'deleted') {
        const dataSource = await useDataSource();

        const projectRepository = dataSource.getRepository(ProjectEntity);
        const projects = await projectRepository.find({
            where: {
                user_id: context.data.id,
            },
        });

        for (let i = 0; i < projects.length; i++) {
            projects[i].user_id = null;
        }

        await projectRepository.save(projects);

        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analyses = await analysisRepository.find({
            where: {
                user_id: context.data.id,
            },
        });

        for (let i = 0; i < analyses.length; i++) {
            analyses[i].user_id = null;
        }

        await analysisRepository.save(analyses);

        const analysisFileRepository = dataSource.getRepository(AnalysisEntity);
        const analysisFiles = await analysisFileRepository.find({
            where: {
                user_id: context.data.id,
            },
        });

        await analysisRepository.remove(analysisFiles);
    }
}
