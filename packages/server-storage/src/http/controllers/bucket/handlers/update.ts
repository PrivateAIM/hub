/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import {
    HTTPHandlerOperation,
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { useMinio } from '../../../../core/index.ts';
import { BucketEntity } from '../../../../database/index.ts';
import {
    isBucketOwnedByIdentity, toBucketName,
} from '../../../../domains/index.ts';
import { BucketValidator } from '../utils/validation.ts';

export async function executeBucketRouteUpdateHandler(req: Request, res: Response) : Promise<any> {
    const validator = new BucketValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const query = repository.createQueryBuilder('bucket');
    if (isUUID(id)) {
        query.where('bucket.id = :id', { id });
    } else {
        query.where('bucket.name LIKE :name', { name: id });
    }
    let entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    const actor = useRequestIdentityOrFail(req);
    if (!isBucketOwnedByIdentity(entity, actor)) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheck({ name: PermissionName.BUCKET_UPDATE });

        if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
            throw new ForbiddenError();
        }
    }

    entity = repository.merge(entity, data);

    await repository.save(entity);

    const minio = useMinio();
    const hasBucket = await minio.bucketExists(entity.id);
    if (!hasBucket) {
        if (entity.region) {
            await minio.makeBucket(toBucketName(entity.id), entity.region);
        } else {
            await minio.makeBucket(toBucketName(entity.id));
        }
    }

    return sendAccepted(res, entity);
}
