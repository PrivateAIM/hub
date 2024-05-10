/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core-kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@privateaim/core';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';
import { runAnalysisValidation } from '../utils';

export async function updateAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.ANALYSIS_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runAnalysisValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    if (
        entity.registry_id &&
        result.data.registry_id &&
        entity.registry_id !== result.data.registry_id
    ) {
        throw new BadRequestError('The registry can not be changed after it is specified.');
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return sendAccepted(res, entity);
}
