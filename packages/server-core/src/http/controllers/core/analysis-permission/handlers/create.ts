/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { AnalysisPermissionEntity } from '../../../../../domains';
import { runAnalysisPermissionValidation } from '../utils';

export async function createAnalysisPermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

    const result = await runAnalysisPermissionValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);

    let entity = repository.create(result.data);

    entity = await repository.save(entity);

    entity.analysis = result.relation.analysis;

    return sendCreated(res, entity);
}
