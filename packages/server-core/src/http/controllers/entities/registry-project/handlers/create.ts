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
import { RegistryCommand, useRegistryComponentCaller } from '../../../../../components/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { RegistryProjectValidator } from '../utils/index.ts';
import { RegistryProjectEntity } from '../../../../../database/index.ts';

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

    const caller = useRegistryComponentCaller();
    await caller.call(
        RegistryCommand.PROJECT_LINK,
        {
            id: entity.id,
        },
        {},
    );

    return sendCreated(res, entity);
}
