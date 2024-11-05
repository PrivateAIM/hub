/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { ProjectNodeEntity } from '../../../../domains';
import { HTTPHandlerOperation } from '../../constants';
import { ProjectNodeValidator } from '../utils';

export async function updateProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const validator = new ProjectNodeValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectNodeEntity);
    let entity = await repository.findOneBy({ id });
    if (!entity) {
        throw new NotFoundError();
    }

    const permissionChecker = useRequestPermissionChecker(req);

    const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(req), entity.node_realm_id);
    if (isAuthorityOfNode) {
        throw new ForbiddenError('You are not permitted to update this object.');
    }

    await permissionChecker.preCheck({ name: PermissionName.PROJECT_APPROVE });

    entity = repository.merge(entity, data);

    entity = await repository.save(entity);

    return sendAccepted(res, entity);
}
