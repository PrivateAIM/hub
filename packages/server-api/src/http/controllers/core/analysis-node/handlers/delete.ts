/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/core';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { MoreThan } from 'typeorm';
import { isRealmResourceWritable } from '@authup/core';
import { useDataSource } from 'typeorm-extension';
import { AnalysisNodeEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';
import { AnalysisEntity } from '../../../../../domains';

export async function deleteAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionID.ANALYSIS_EDIT) &&
        !ability.has(PermissionID.ANALYSIS_APPROVE)
    ) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.node_realm_id) &&
        !isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.analysis_realm_id)
    ) {
        throw new ForbiddenError();
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    // -------------------------------------------

    await repository.createQueryBuilder()
        .update()
        .where({
            index: MoreThan(entity.index),
            analysis_id: entity.analysis_id,
        })
        .set({
            index: () => '`index` - 1',
        })
        .execute();

    // -------------------------------------------

    const analysisRepository = dataSource.getRepository(AnalysisEntity);
    const analysis = await analysisRepository.findOneBy({ id: entity.analysis_id });

    analysis.nodes -= 1;
    await analysisRepository.save(analysis);

    entity.analysis = analysis;

    // -------------------------------------------

    return sendAccepted(res, entity);
}
