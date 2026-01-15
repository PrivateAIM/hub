/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { isAuthupClientUsable, useAuthupClient } from '@privateaim/server-kit';
import type { Permission } from '@authup/core-kit';
import { isClientErrorWithStatusCode } from '@hapic/harbor';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import { buildErrorMessageForAttributes } from 'validup';
import { AnalysisPermissionEntity } from '../../../../../database/domains/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { AnalysisPermissionValidator } from '../utils/index.ts';

export async function createAnalysisPermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

    const validator = new AnalysisPermissionValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisPermissionEntity,
    });

    data.analysis_realm_id = data.analysis.realm_id;

    if (isAuthupClientUsable()) {
        const authup = useAuthupClient();

        if (data.permission_id) {
            let permission: Permission;
            try {
                permission = await authup.permission.getOne(data.permission_id);

                data.permission = permission;
                data.permission_realm_id = permission.realm_id;
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    throw new BadRequestError(buildErrorMessageForAttributes(['permission_id']));
                }

                throw e;
            }

            try {
                await permissionChecker.preCheck({ name: permission.name });
            } catch (e) {
                throw new ForbiddenError(`You don't own the permission ${permission.name}`);
            }
        }

        if (data.policy_id) {
            try {
                const policy = await authup.policy.getOne(data.policy_id);

                data.policy = policy;
                data.policy_id = policy.id;
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    throw new BadRequestError(buildErrorMessageForAttributes(['policy_id']));
                }

                throw e;
            }
        }
    }

    const repository = dataSource.getRepository(AnalysisPermissionEntity);

    let entity = repository.create(data);

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    entity = await requestRepository.save(entity);
    return sendCreated(res, entity);
}
