/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { AnalysisEntity, AnalysisNodeEntity, AnalysisNodeEventEntity } from '../../../../domains';

export async function deleteAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheckOneOf({
        name: [
            PermissionName.ANALYSIS_UPDATE,
            PermissionName.ANALYSIS_APPROVE,
        ],
    });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isRealmResourceWritable(useRequestIdentityRealm(req), entity.node_realm_id) &&
        !isRealmResourceWritable(useRequestIdentityRealm(req), entity.analysis_realm_id)
    ) {
        throw new ForbiddenError();
    }

    await dataSource.transaction(async (entityManager) => {
        const { id: entityId } = entity;

        const analysisRepository = entityManager.getRepository(AnalysisEntity);
        await analysisRepository.createQueryBuilder()
            .update()
            .where({
                id: entity.analysis_id,
            })
            .set({
                nodes: () => '`nodes` - 1',
            })
            .execute();

        const analysisNodeEventRepository = entityManager.getRepository(AnalysisNodeEventEntity);
        await analysisNodeEventRepository.createQueryBuilder()
            .delete()
            .where({
                id: entity.analysis_id,
            })
            .execute();

        const repository = entityManager.getRepository(AnalysisNodeEntity);
        await repository.remove(entity);

        entity.id = entityId;
    });

    // -------------------------------------------

    return sendAccepted(res, entity);
}
