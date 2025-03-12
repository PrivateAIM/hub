/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { AnalysisNodeLogEntity } from '../../../../domains';
import { AnalysisNodeLogValidator } from '../utils';

export async function updateAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const validator = new AnalysisNodeLogValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeLogEntity);
    let entity = await repository.findOne({
        where: {
            id,
        },
    });

    if (!entity) {
        throw new NotFoundError();
    }

    const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(req), entity.node_realm_id);
    if (!isAuthorityOfNode) {
        throw new ForbiddenError('You are not associated to the node realm.');
    }

    // todo: how to proceed here ? new permission ANALYSIS_NODE_UPDATE?
    // const permissionChecker = useRequestPermissionChecker(req);
    // await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

    entity = repository.merge(entity, data);

    entity = await repository.save(entity);

    // todo update: analysisNode run_status if (status === AnalysisNodeRunStatus)

    return sendAccepted(res, entity);
}
