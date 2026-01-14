/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { MasterImageGroupEntity } from '../../../../../database/domains/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';

export async function deleteMasterImageGroupRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.MASTER_IMAGE_GROUP_MANAGE });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageGroupEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.remove(entity);

    return sendAccepted(res, entity);
}
