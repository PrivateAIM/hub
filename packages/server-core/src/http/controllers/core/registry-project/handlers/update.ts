/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { isRealmResourceWritable } from '@authup/core-kit';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { RegistryCommand, buildRegistryTaskQueueRouterPayload } from '../../../../../components';
import { runRegistryProjectValidation } from '../utils';
import { RegistryProjectEntity } from '../../../../../domains';

export async function updateRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'abilities');
    if (!ability.has(PermissionName.REGISTRY_PROJECT_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryProjectValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    if (isQueueRouterUsable()) {
        const client = useQueueRouter();

        if (
            entity.external_name &&
            result.data.external_name &&
            entity.external_name !== result.data.external_name
        ) {
            await client.publish(buildRegistryTaskQueueRouterPayload({
                command: RegistryCommand.PROJECT_UNLINK,
                data: {
                    id: entity.id,
                    registryId: entity.registry_id,
                    externalName: result.data.external_name,
                    accountId: result.data.account_id,
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
