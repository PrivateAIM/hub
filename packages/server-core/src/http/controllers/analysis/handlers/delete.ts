/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { AnalysisEntity, ProjectEntity } from '../../../../database';
import { isAnalysisManagerUsable, useAnalysisManager } from '../../../../services';
import { RequestRepositoryAdapter } from '../../../request';

export async function deleteAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_DELETE });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOne({ where: { id }, relations: ['project'] });

    if (!entity) {
        throw new NotFoundError();
    }

    await permissionChecker.check({
        name: PermissionName.ANALYSIS_DELETE,
        input: {
            attributes: entity,
        },
    });

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }

    const { project } = entity;

    const { id: entityId } = entity;

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.remove(entity);

    entity.id = entityId;

    project.analyses--;
    const proposalRepository = dataSource.getRepository(ProjectEntity);
    await proposalRepository.save(project);

    if (isAnalysisManagerUsable()) {
        const analysisManager = useAnalysisManager();
        await analysisManager.tearDown(entity);
    }

    entity.project = project;

    return sendAccepted(res, entity);
}
