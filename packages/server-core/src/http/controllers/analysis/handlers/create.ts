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
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import {
    HTTPHandlerOperation,
    useRequestIdentityOrFail,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { AnalysisValidator } from '../utils';
import { AnalysisEntity, ProjectEntity } from '../../../../database';
import { isAnalysisManagerUsable, useAnalysisManager } from '../../../../services';

export async function createAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_CREATE });

    const validator = new AnalysisValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisEntity,
    });

    if (!data.master_image_id) {
        data.master_image_id = data.project.master_image_id;
    }

    data.realm_id = data.project.realm_id;

    const repository = dataSource.getRepository<Analysis>(AnalysisEntity);
    const identity = useRequestIdentityOrFail(req);

    const entity = repository.create({
        realm_id: identity.realmId,
        ...data,
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

    entity.project.analyses++;
    const proposalRepository = dataSource.getRepository(ProjectEntity);
    await proposalRepository.save(entity.project);

    if (isAnalysisManagerUsable()) {
        const analysisManager = useAnalysisManager();
        await analysisManager.spinUp(entity);
    }

    return sendCreated(res, entity);
}
