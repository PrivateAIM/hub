/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isEntityUnique, useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import {
    HTTPHandlerOperation,
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { DatabaseConflictError } from '../../../../../database/index.ts';
import { ProjectEntity } from '../../../../../database/domains/index.ts';
import { ProjectValidator } from '../utils/validator.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';

export async function createProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.PROJECT_CREATE });

    const validator = new ProjectValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: ProjectEntity,
    });

    const realm = useRequestIdentityRealm(req);
    if (data.realm_id) {
        if (!isRealmResourceWritable(realm, data.realm_id)) {
            throw new ForbiddenError('You are not permitted to create this project.');
        }
    } else {
        data.realm_id = realm.id;
    }

    const identity = useRequestIdentityOrFail(req);
    switch (identity.type) {
        case 'user': {
            data.user_id = identity.id;
            break;
        }
        case 'robot': {
            data.robot_id = identity.id;
            break;
        }
        default: {
            throw new BadRequestError('Only user-/robot-accounts are permitted to create a project');
        }
    }

    const repository = dataSource.getRepository(ProjectEntity);
    const entity = repository.create(data);

    const isUnique = await isEntityUnique({
        entity,
        entityTarget: ProjectEntity,
        dataSource,
    });
    if (!isUnique) {
        throw new DatabaseConflictError();
    }

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.save(entity);

    return sendCreated(res, entity);
}
