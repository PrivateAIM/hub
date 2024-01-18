/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/core';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/core';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import { applyFilters, useDataSource } from 'typeorm-extension';
import { onlyRealmWritableQueryResources } from '../../../../../domains';
import { AnalysisFileEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function getOneAnalysisFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionID.ANALYSIS_ADD) &&
        !ability.has(PermissionID.ANALYSIS_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisFileEntity);

    const entity = await repository.findOneBy({
        id,
    });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyAnalysisFileGetManyRouteHandler(req: Request, res: Response) : Promise<any> {
    const { filter } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisFileEntity);
    const query = repository.createQueryBuilder('trainFile');

    onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'));

    applyFilters(query, filter, {
        defaultAlias: 'trainFile',
        allowed: ['id', 'name', 'analysis_id', 'realm_id'],
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
        },
    });
}
