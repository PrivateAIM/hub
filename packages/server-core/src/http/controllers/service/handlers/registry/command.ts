/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    RegistryAPICommand,
} from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import {
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import {
    RegistryCommand,
    buildRegistryTaskQueueRouterPayload,
} from '../../../../../components';
import { RegistryEntity, RegistryProjectEntity } from '../../../../../database/domains';
import { ServiceRegistryValidator } from '../../utils/validation';

export async function handleRegistryCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

    const validator = new ServiceRegistryValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const result = await validatorAdapter.run(req);

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
