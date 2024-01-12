/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core';
import { PermissionID } from '@personalhealthtrain/core';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisNodeEntity } from '../../../../../domains/anaylsis-node/entity';
import { useRequestEnv } from '../../../../request';
import { runTrainStationValidation } from '../utils';

export async function updateTrainStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    const ability = useRequestEnv(req, 'ability');

    const isAuthorityOfStation = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.node_realm_id);
    const isAuthorizedForStation = ability.has(PermissionID.ANALYSIS_APPROVE);

    const isAuthorityOfTrain = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.analysis_realm_id);
    const isAuthorizedForTrain = ability.has(PermissionID.ANALYSIS_EDIT);

    if (
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfTrain && isAuthorizedForTrain)
    ) {
        throw new ForbiddenError();
    }

    const result = await runTrainStationValidation(req, 'update');

    if (!isAuthorityOfStation) {
        if (result.data.approval_status) {
            delete result.data.approval_status;
        }

        if (result.data.comment) {
            delete result.data.comment;
        }
    }

    if (!isAuthorityOfTrain) {
        if (result.data.index) {
            delete result.data.index;
        }
    }

    entity = repository.merge(entity, result.data);

    entity = await repository.save(entity);

    return sendAccepted(res, entity);
}
