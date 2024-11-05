/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { AnalysisNodeEntity } from '../../../../domains';
import { AnalysisNodeValidator } from '../utils';
import { HTTPHandlerOperation } from '../../constants';

export async function updateAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const validator = new AnalysisNodeValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);
    let entity = await repository.findOne({
        where: {
            id,
        },
        relations: ['analysis'],
    });

    if (!entity) {
        throw new NotFoundError();
    }

    if (entity.analysis.configuration_locked) {
        throw new BadRequestError('The analysis is locked right now. It is not possible to add new nodes.');
    }

    const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(req), entity.node_realm_id);
    const isAuthorityOfAnalysis = isRealmResourceWritable(useRequestIdentityRealm(req), entity.analysis_realm_id);

    if (!isAuthorityOfNode && !isAuthorityOfAnalysis) {
        throw new ForbiddenError('You are neither part of the node nor analysis realm.');
    }

    const permissionChecker = useRequestPermissionChecker(req);

    let canUpdate = false;
    try {
        await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });
        canUpdate = true;
    } catch (e) {
        // do nothing
    }
    let canApprove = false;
    try {
        await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_APPROVE });
        canApprove = true;
    } catch (e) {
        // do nothing
    }

    if (!canUpdate && !canApprove) {
        throw new ForbiddenError();
    }

    if (!isAuthorityOfNode || !canApprove) {
        if (data.approval_status || data.comment) {
            throw new BadRequestError(
                'You are either no authority of the node or you don\'t have the required permissions',
            );
        }
    }

    if (!isAuthorityOfNode || !canUpdate) {
        if (data.run_status) {
            throw new BadRequestError(
                'You are either no authority of the node or you don\'t have the required permissions',
            );
        }
    }

    if (!isAuthorityOfAnalysis || !canUpdate) {
        if (data.index) {
            throw new BadRequestError(
                'You are either no authority of the analysis or you don\'t have the required permissions',
            );
        }
    }

    entity = repository.merge(entity, data);

    entity = await repository.save(entity);

    return sendAccepted(res, entity);
}
