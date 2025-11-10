/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import {
    HTTPHandlerOperation,
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import { BucketEntity, toBucketName } from '../../../../domains';
import { BucketValidator } from '../utils/validation';

export async function executeBucketRouteCreateHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.BUCKET_CREATE });

    const actor = useRequestIdentityOrFail(req);
    if (!actor) {
        throw new ForbiddenError('Only users and robots are permitted to create a bucket.');
    }

    const validator = new BucketValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const realm = useRequestIdentityRealm(req);
    if (data.realm_id) {
        if (!isRealmResourceWritable(realm, data.realm_id)) {
            throw new ForbiddenError('You are not permitted to create this bucket.');
        }
    } else {
        data.realm_id = realm.id;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const entity = repository.create({
        actor_id: actor.id,
        actor_type: actor.type,
        ...data,
    });

    await repository.save(entity);

    const minio = useMinio();
    if (entity.region) {
        await minio.makeBucket(toBucketName(entity.id), entity.region);
    } else {
        await minio.makeBucket(toBucketName(entity.id));
    }

    return sendCreated(res, entity);
}
