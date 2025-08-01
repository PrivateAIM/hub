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
import { HTTPHandlerOperation, useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { RegistryCommand, buildRegistryTaskQueueRouterPayload } from '../../../../components';
import { RequestRepositoryAdapter } from '../../../request';
import { RegistryProjectValidator } from '../utils';
import { RegistryProjectEntity } from '../../../../database/domains';

export async function updateRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

    const validator = new RegistryProjectValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, data);

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.save(entity);

    if (isQueueRouterUsable()) {
        const client = useQueueRouter();

        if (
            entity.external_name &&
            data.external_name &&
            entity.external_name !== data.external_name
        ) {
            await client.publish(buildRegistryTaskQueueRouterPayload({
                command: RegistryCommand.PROJECT_UNLINK,
                data: {
                    id: entity.id,
                    registryId: entity.registry_id,
                    externalName: data.external_name,
                    accountId: data.account_id,
                },
            }));
        }

        await client.publish(buildRegistryTaskQueueRouterPayload({
            command: RegistryCommand.PROJECT_LINK,
            data: {
                id: entity.id,
            },
        }));
    }

    return sendAccepted(res, entity);
}
