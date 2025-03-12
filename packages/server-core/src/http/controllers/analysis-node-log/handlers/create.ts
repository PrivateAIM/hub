/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core-kit';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import { AnalysisNodeRunStatus } from '@privateaim/core-kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import {
    AnalysisNodeEntity, AnalysisNodeLogEntity,
} from '../../../../domains';
import { AnalysisNodeLogValidator } from '../utils';

export async function createAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    // const permissionChecker = useRequestPermissionChecker(req);
    // await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

    const validator = new AnalysisNodeLogValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisNodeLogEntity,
    });

    data.analysis_realm_id = data.analysis.realm_id;
    data.node_realm_id = data.node.realm_id;

    const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(req), data.node_realm_id);
    if (!isAuthorityOfNode) {
        throw new ForbiddenError('You are not an actor of to the node realm.');
    }

    const entity = await dataSource.transaction(async (entityManager) => {
        const analysisNodeRepository = entityManager.getRepository(AnalysisNodeEntity);
        const analysisNode = await analysisNodeRepository.findOneBy({
            analysis_id: data.analysis_id,
            node_id: data.node_id,
        });

        if (analysisNode) {
            const runStatus = Object.values(AnalysisNodeRunStatus) as string[];
            if (runStatus.indexOf(data.status) !== -1) {
                analysisNode.run_status = data.status as AnalysisNodeRunStatus;

                await analysisNodeRepository.save(analysisNode);
            }
        } else {
            throw new BadRequestError('A relation between analysis and node must exist to create logs.');
        }

        const repository = entityManager.getRepository(AnalysisNodeLogEntity);
        const entity = repository.create(data);
        return repository.save(entity);
    });

    return sendCreated(res, entity);
}
