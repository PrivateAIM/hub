/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import { PermissionName, getHostNameFromString } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { RegistryValidator } from '../utils/index.ts';
import { RegistryEntity } from '../../../../../database/domains/index.ts';

export async function updateRegistryRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

    const validator = new RegistryValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    if (data.host) {
        data.host = getHostNameFromString(data.host);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    entity = repository.merge(entity, data);

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.save(entity);

    return sendAccepted(res, entity);
}
