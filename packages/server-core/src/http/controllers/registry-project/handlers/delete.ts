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
import { isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { RegistryCommand, buildRegistryTaskQueueRouterPayload } from '../../../../components';
import { RegistryProjectEntity } from '../../../../domains';

export async function deleteRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(RegistryProjectEntity);
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    if (isQueueRouterUsable()) {
        const client = useQueueRouter();
        await client.publish(buildRegistryTaskQueueRouterPayload({
            command: RegistryCommand.PROJECT_UNLINK,
            data: {
                id: entity.id,
                registryId: entity.registry_id,
                externalName: entity.external_name,
                accountId: entity.account_id,
            },
        }));
    }

    return sendAccepted(res, entity);
}
