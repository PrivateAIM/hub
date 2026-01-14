/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName, ProcessStatus, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { In } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import {
    AnalysisEntity,
    AnalysisNodeEntity,
    ProjectEntity,
    ProjectNodeEntity,
} from '../../../../../database/domains/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';

export async function deleteProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({
        name: [
            PermissionName.PROJECT_CREATE,
            PermissionName.PROJECT_UPDATE,
        ],
    });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectNodeEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isRealmResourceWritable(useRequestIdentityRealm(req), entity.node_realm_id) &&
        !isRealmResourceWritable(useRequestIdentityRealm(req), entity.project_realm_id)
    ) {
        throw new ForbiddenError('You are not authorized to drop this relation object.');
    }

    // -------------------------------------------

    const analysisRepository = dataSource.getRepository(AnalysisEntity);
    const analyses = await analysisRepository.find({
        where: {
            project_id: entity.project_id,
        },
    });

    if (analyses.length > 0) {
        const analysisIDs = analyses.map((analysis) => analysis.id);

        const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
        const analysisNodes = await analysisNodeRepository.find({
            where: {
                analysis_id: In(analysisIDs),
                node_id: entity.node_id,
            },
        });

        if (analysisNodes.length > 0) {
            let nodeIsActivelyUsed: boolean = false;
            for (let i = 0; i < analysisNodes.length; i++) {
                if (
                    analysisNodes[i].execution_status &&
                    analysisNodes[i].execution_status !== ProcessStatus.FAILED
                ) {
                    nodeIsActivelyUsed = true;
                    break;
                }

                const index = analyses.findIndex((analysis) => analysis.id === analysisNodes[i].analysis_id);
                if (index !== -1) {
                    analyses[i].nodes -= 1;
                }
            }

            if (nodeIsActivelyUsed) {
                throw new BadRequestError(
                    'The node can not be disconnected from the project because it is used by an analysis.',
                );
            }

            await analysisNodeRepository.remove(analysisNodes);
            await analysisRepository.save(analyses);
        }
    }

    // -------------------------------------------

    const { id: entityId } = entity;

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.remove(entity);

    entity.id = entityId;

    // -------------------------------------------

    const projectRepository = dataSource.getRepository(ProjectEntity);
    const project = await projectRepository.findOneBy({ id: entity.project_id });

    project.nodes -= 1;
    await projectRepository.save(project);

    entity.project = project;

    // -------------------------------------------

    return sendAccepted(res, entity);
}
