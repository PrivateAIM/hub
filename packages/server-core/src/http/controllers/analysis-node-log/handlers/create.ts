/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import {
    AnalysisNodeEntity, AnalysisNodeLogEntity, ProjectNodeEntity,
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

    const projectNodeRepository = dataSource.getRepository(ProjectNodeEntity);
    const projectNode = await projectNodeRepository.findOneBy({
        project_id: data.analysis.project_id,
        node_id: data.node_id,
    });

    if (!projectNode) {
        throw new NotFoundError('The referenced node is not part of the analysis project.');
    }

    const repository = dataSource.getRepository(AnalysisNodeEntity);
    let entity = repository.create(data);

    entity = await repository.save(entity);

    // todo update: analysisNode run_status if (status === AnalysisNodeRunStatus)

    return sendCreated(res, entity);
}
