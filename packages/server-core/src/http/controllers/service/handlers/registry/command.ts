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
    RegistryCommand,
    useRegistryComponentCaller,
} from '../../../../../components';
import { RegistryEntity, RegistryProjectEntity } from '../../../../../database';
import { ServiceRegistryValidator } from '../../utils/validation';

export async function handleRegistryCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

    const validator = new ServiceRegistryValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const result = await validatorAdapter.run(req);

    const dataSource = await useDataSource();
    const caller = useRegistryComponentCaller();

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
                await caller.call(
                    RegistryCommand.SETUP,
                    {
                        id: entity.id,
                    },
                    {},
                );
            } else if (result.command === RegistryAPICommand.DELETE) {
                await caller.call(
                    RegistryCommand.DELETE,
                    {
                        id: entity.id,
                    },
                    {},
                );
            } else {
                await caller.call(
                    RegistryCommand.CLEANUP,
                    {
                        id: entity.id,
                    },
                    {},
                );
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
                await caller.call(
                    RegistryCommand.PROJECT_LINK,
                    {
                        id: entity.id,
                        secret: result.secret,
                    },
                    {},
                );
            } else {
                await caller.call(
                    RegistryCommand.PROJECT_UNLINK,
                    {
                        id: entity.id,
                        registryId: entity.registry_id,
                        externalName: entity.external_name,
                        accountId: entity.account_id,
                    },
                    {},
                );
            }
            break;
        }
    }

    return sendAccepted(res);
}
