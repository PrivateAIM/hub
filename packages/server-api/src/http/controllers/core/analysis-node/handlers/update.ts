/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core';
import { PermissionID } from '@privateaim/core';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisNodeEntity } from '../../../../../domains/anaylsis-node/entity';
import { useRequestEnv } from '../../../../request';
import { runAnalysisNodeValidation } from '../utils';

export async function updateAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    const ability = useRequestEnv(req, 'ability');

    const isAuthorityOfNode = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.node_realm_id);
    const isAuthorizedForNode = ability.has(PermissionID.ANALYSIS_APPROVE);

    const isAuthorityOfAnalysis = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.analysis_realm_id);
    const isAuthorizedForAnalysis = ability.has(PermissionID.ANALYSIS_EDIT);

    if (
        !(isAuthorityOfNode && isAuthorizedForNode) &&
        !(isAuthorityOfAnalysis && isAuthorizedForAnalysis)
    ) {
        throw new ForbiddenError();
    }

    const result = await runAnalysisNodeValidation(req, 'update');

    if (!isAuthorityOfNode) {
        if (result.data.approval_status) {
            delete result.data.approval_status;
        }

        if (result.data.comment) {
            delete result.data.comment;
        }
    }

    if (!isAuthorityOfAnalysis) {
        if (result.data.index) {
            delete result.data.index;
        }
    }

    entity = repository.merge(entity, result.data);

    entity = await repository.save(entity);

    return sendAccepted(res, entity);
}
