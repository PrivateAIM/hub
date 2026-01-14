/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { isPropertySet } from '@authup/kit';
import { AnalysisEntity } from '../../../../../database/domains/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { AnalysisValidator } from '../utils/index.ts';

export async function updateAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

    const validator = new AnalysisValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    const dataSource = await useDataSource();

    // todo: this should only validate non null/undefined values
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisEntity,
    });

    const repository = dataSource.getRepository(AnalysisEntity);
    let entity = await repository.findOneBy({ id });
    if (!entity) {
        throw new NotFoundError();
    }

    await permissionChecker.check({
        name: PermissionName.ANALYSIS_UPDATE,
        input: {
            attributes: entity,
        },
    });

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }

    if (
        entity.registry_id &&
        data.registry_id &&
        entity.registry_id !== data.registry_id
    ) {
        throw new BadRequestError('The registry can not be changed after it is specified.');
    }

    if (isPropertySet(data, 'master_image_id')) {
        if (data.master_image_id !== entity.master_image_id) {
            data.image_command_arguments = null;
        }
    }

    entity = repository.merge(entity, data);

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.save(entity);

    return sendAccepted(res, entity);
}
