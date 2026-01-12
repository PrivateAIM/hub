/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DataSource } from 'typeorm';
import {
    AnalysisEntity, AnalysisNodeEntity, ProjectEntity, ProjectNodeEntity,
} from '../../database';

export class DatabaseIntegrityService {
    protected dataSource : DataSource;

    constructor(datasource: DataSource) {
        this.dataSource = datasource;
    }

    async check() {
        await this.checkAnalyses();
        await this.checkProjects();
    }

    async checkAnalyses() {
        const analysisNodeRepository = this.dataSource.getRepository(AnalysisNodeEntity);
        const analysisNodes = await analysisNodeRepository.find();

        const nodeCountByAnalysisID = analysisNodes.reduce(
            (stack, current) => {
                if (!stack[current.analysis_id]) {
                    stack[current.analysis_id] = 0;
                }

                stack[current.analysis_id] += 1;

                return stack;
            },
            {} as Record<string, number>,
        );

        const analysisRepository = this.dataSource.getRepository(AnalysisEntity);
        const keys = Object.keys(nodeCountByAnalysisID);
        for (let i = 0; i < keys.length; i++) {
            await analysisRepository.update({
                id: keys[i],
            }, {
                nodes: nodeCountByAnalysisID[keys[i]],
            });
        }
    }

    async checkProjects() {
        const projectNodeRepository = this.dataSource.getRepository(ProjectNodeEntity);
        const projectNodes = await projectNodeRepository.find();

        const nodeCountByProjectID = projectNodes.reduce(
            (stack, current) => {
                if (!stack[current.project_id]) {
                    stack[current.project_id] = 0;
                }

                stack[current.project_id] += 1;

                return stack;
            },
            {} as Record<string, number>,
        );

        const projectRepository = this.dataSource.getRepository(ProjectEntity);
        const analysisRepository = this.dataSource.getRepository(AnalysisEntity);

        const projects = await projectRepository.find();
        for (let i = 0; i < projects.length; i++) {
            const analyses = await analysisRepository.find({
                where: {
                    project_id: projects[i].id,
                },
            });

            projects[i].analyses = analyses.length;
            projects[i].nodes = nodeCountByProjectID[projects[i].id] || 0;
        }

        await projectRepository.save(projects);
    }
}
