/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError } from '@ebec/http';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { runRegistryValidation } from '../utils';
import { RegistryEntity } from '../../../../../domains';

export async function createRegistryRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');

    if (!ability.has(PermissionName.REGISTRY_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    const entity = repository.create(result.data);

    await repository.save(entity);

    return sendCreated(res, entity);
}
