/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';
import { ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../../request';
import { runAnalysisValidation } from '../utils';
import { ProjectEntity } from '../../../../../domains/project/entity';
import { AnalysisEntity } from '../../../../../domains/analysis';

export async function createAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.ANALYSIS_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runAnalysisValidation(req, 'create');

    if (
        !result.data.master_image_id &&
        result.relation.project
    ) {
        result.data.master_image_id = result.relation.project.master_image_id;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Analysis>(AnalysisEntity);

    const realm = useRequestEnv(req, 'realm');

    const entity = repository.create({
        realm_id: realm.id,
        user_id: useRequestEnv(req, 'userId'),
        ...result.data,
    });

    await repository.save(entity);

    result.relation.project.analyses++;
    const proposalRepository = dataSource.getRepository(ProjectEntity);
    await proposalRepository.save(result.relation.project);

    return sendCreated(res, entity);
}
