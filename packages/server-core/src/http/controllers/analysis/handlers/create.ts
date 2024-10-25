/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError } from '@ebec/http';
import type { Analysis } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import {
    useRequestIdentityOrFail,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { runAnalysisValidation } from '../utils';
import { AnalysisEntity, ProjectEntity, runAnalysisSpinUpCommand } from '../../../../domains';

export async function createAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_CREATE });

    const result = await runAnalysisValidation(req, 'create');

    if (
        !result.data.master_image_id &&
        result.relation.project
    ) {
        result.data.master_image_id = result.relation.project.master_image_id;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Analysis>(AnalysisEntity);

    const identity = useRequestIdentityOrFail(req);

    const entity = repository.create({
        realm_id: identity.realmId,
        ...result.data,
    });
    switch (identity.type) {
        case 'user': {
            entity.user_id = identity.id;
            break;
        }
        // todo: support robot as well
        default: {
            throw new ForbiddenError('Only user accounts are permitted to create an analysis.');
        }
    }

    await permissionChecker.check({
        name: PermissionName.ANALYSIS_CREATE,
        data: {
            attributes: entity,
        },
    });

    await repository.save(entity);

    result.relation.project.analyses++;
    const proposalRepository = dataSource.getRepository(ProjectEntity);
    await proposalRepository.save(result.relation.project);

    await runAnalysisSpinUpCommand(entity);

    return sendCreated(res, entity);
}
