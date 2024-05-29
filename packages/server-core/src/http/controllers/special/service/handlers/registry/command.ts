/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID, RegistryAPICommand,
} from '@privateaim/core';
import {
    ForbiddenError,
} from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '@privateaim/server-http-kit';
import {
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import {
    RegistryCommand,
    buildRegistryTaskQueueRouterPayload,
} from '../../../../../../components';
import { RegistryEntity, RegistryProjectEntity } from '../../../../../../domains';
import { runServiceRegistryValidation } from '../../utils/validation';

export async function handleRegistryCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');

    if (!ability.has(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError('You are not permitted to manage the registry.');
    }

    const { data: result } = await runServiceRegistryValidation(req);

    if (!isQueueRouterUsable()) {
        return sendAccepted(res);
    }

    const client = useQueueRouter();

    const dataSource = await useDataSource();

    switch (result.command) {
        case RegistryAPICommand.SETUP:
        case RegistryAPICommand.CLEANUP:
        case RegistryAPICommand.DELETE: {
            const repository = dataSource.getRepository(RegistryEntity);
            const entity = await repository.createQueryBuilder('registry')
                .addSelect([
                    'registry.account_secret',
                ])
                .where('registry.id = :id', { id: result.id })
                .getOne();

            if (result.command === RegistryAPICommand.SETUP) {
                useLogger().info('Submitting setup registry command.');

                const queueMessage = buildRegistryTaskQueueRouterPayload({
                    command: RegistryCommand.SETUP,
                    data: {
                        id: entity.id,
                    },
                });

                await client.publish(queueMessage);
            } else if (result.command === RegistryAPICommand.DELETE) {
                useLogger().info('Submitting delete registry command.');

                const queueMessage = buildRegistryTaskQueueRouterPayload({
                    command: RegistryCommand.DELETE,
                    data: {
                        id: entity.id,
                    },
                });

                await client.publish(queueMessage);
            } else {
                useLogger().info('Submitting cleanup registry command.');

                const queueMessage = buildRegistryTaskQueueRouterPayload({
                    command: RegistryCommand.CLEANUP,
                    data: {
                        id: entity.id,
                    },
                });

                await client.publish(queueMessage);
            }
            break;
        }
        case RegistryAPICommand.PROJECT_LINK:
        case RegistryAPICommand.PROJECT_UNLINK: {
            const repository = dataSource.getRepository(RegistryProjectEntity);
            const entity = await repository.createQueryBuilder('registryProject')
                .addSelect([
                    'registryProject.account_secret',
                ])
                .where('registryProject.id = :id', { id: result.id })
                .getOne();

            if (result.command === RegistryAPICommand.PROJECT_LINK) {
                const queueMessage = buildRegistryTaskQueueRouterPayload({
                    command: RegistryCommand.PROJECT_LINK,
                    data: {
                        id: entity.id,
                        secret: result.secret,
                    },
                });
                await client.publish(queueMessage);
            } else {
                const queueMessage = buildRegistryTaskQueueRouterPayload({
                    command: RegistryCommand.PROJECT_UNLINK,
                    data: {
                        id: entity.id,
                        registryId: entity.registry_id,
                        externalName: entity.external_name,
                        accountId: entity.account_id,
                    },
                });
                await client.publish(queueMessage);
            }
            break;
        }
    }

    return sendAccepted(res);
}
