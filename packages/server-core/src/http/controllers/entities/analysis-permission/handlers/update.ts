/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import {
    HTTPHandlerOperation,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { isAuthupClientUsable, useAuthupClient } from '@privateaim/server-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { isClientErrorWithStatusCode } from '@hapic/harbor';
import { buildErrorMessageForAttributes } from 'validup';
import { AnalysisPermissionEntity } from '../../../../../database/domains/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { AnalysisPermissionValidator } from '../utils/index.ts';

export async function updateAnalysisPermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

    const validator = new AnalysisPermissionValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    if (isAuthupClientUsable()) {
        const authup = useAuthupClient();

        if (data.policy_id) {
            try {
                const policy = await authup.policy.getOne(data.policy_id);

                data.policy = policy;
                data.policy_id = policy.id;
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    throw new BadRequestError(buildErrorMessageForAttributes(['permission_id']));
                }

                throw e;
            }
        }
    }

    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);
    let entity = await repository.findOneBy({ id });
    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.analysis_realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, data);

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    entity = await requestRepository.save(entity);

    return sendAccepted(res, entity);
}
