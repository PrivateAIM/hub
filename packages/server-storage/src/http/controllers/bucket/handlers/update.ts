/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import { PermissionID } from '@privateaim/core';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import { BucketEntity, getActorFromRequest, isBucketOwnedByActor } from '../../../../domains';
import { useRequestEnv } from '../../../request';
import { runBucketValidation } from '../utils/validation';

export async function executeBucketRouteUpdateHandler(req: Request, res: Response) : Promise<any> {
    const result = await runBucketValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const query = repository.createQueryBuilder('bucket');
    if (isUUID(id)) {
        query.where('bucket.id LIKE :id', { id });
    } else {
        query.where('bucket.name LIKE :name', { name: id });
    }
    let entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    const actor = getActorFromRequest(req);
    if (!isBucketOwnedByActor(entity, actor)) {
        const ability = useRequestEnv(req, 'abilities');
        if (!ability.has(PermissionID.BUCKET_EDIT)) {
            throw new ForbiddenError();
        }

        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
            throw new ForbiddenError();
        }
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    const minio = useMinio();
    const hasBucket = await minio.bucketExists(entity.name);
    if (!hasBucket) {
        if (entity.region) {
            await minio.makeBucket(entity.name, entity.region);
        } else {
            await minio.makeBucket(entity.name);
        }
    }

    return sendAccepted(res, entity);
}
