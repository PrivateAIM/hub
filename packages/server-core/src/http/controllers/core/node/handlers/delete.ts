/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@privateaim/core';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { RegistryCommand } from '../../../../../components';
import { buildRegistryPayload } from '../../../../../components/registry/utils/queue';
import { hasAmqpClient, useAmqpClient } from '../../../../../core';
import { NodeEntity, RegistryProjectEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';
import { deleteNodeRobot } from '../utils';

export async function deleteNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.NODE_DROP)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(NodeEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (hasAmqpClient()) {
        if (entity.registry_project_id) {
            const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);

            const registryProject = await registryProjectRepository.findOneBy({ id: entity.registry_project_id });
            if (registryProject) {
                const queueMessage = buildRegistryPayload({
                    command: RegistryCommand.PROJECT_UNLINK,
                    data: {
                        id: registryProject.id,
                        registryId: registryProject.registry_id,
                        externalName: registryProject.external_name,
                        accountId: registryProject.account_id,
                    },
                });

                const client = useAmqpClient();
                await client.publish(queueMessage);
                await registryProjectRepository.remove(registryProject);
            }
        }
    }

    const { id: entityId } = entity;

    if (entity.robot_id) {
        await deleteNodeRobot(entity);
    }

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
