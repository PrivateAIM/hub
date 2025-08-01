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
import { isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { RegistryCommand, buildRegistryTaskQueueRouterPayload } from '../../../../components';
import { RequestRepositoryAdapter } from '../../../request';
import { RegistryProjectValidator } from '../utils';
import { RegistryProjectEntity } from '../../../../database/domains';

export async function createRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

    const validator = new RegistryProjectValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: RegistryProjectEntity,
    });

    const repository = dataSource.getRepository(RegistryProjectEntity);
    const entity = repository.create(data);

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.save(entity);

    if (isQueueRouterUsable()) {
        const client = useQueueRouter();
        await client.publish(buildRegistryTaskQueueRouterPayload({
            command: RegistryCommand.PROJECT_LINK,
            data: {
                id: entity.id,
            },
        }));
    }

    return sendCreated(res, entity);
}
