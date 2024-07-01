/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import { PermissionName } from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { useMinio } from '../../../../core';
import {
    BucketEntity, getActorFromRequest, isBucketOwnedByActor, toBucketName,
} from '../../../../domains';

export async function executeBucketRouteDeleteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const query = repository.createQueryBuilder('bucket');
    if (isUUID(id)) {
        query.where('bucket.id = :id', { id });
    } else {
        query.where('bucket.name LIKE :name', { name: id });
    }

    const entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    const actor = getActorFromRequest(req);
    if (!isBucketOwnedByActor(entity, actor)) {
        const ability = useRequestEnv(req, 'abilities');
        if (!ability.has(PermissionName.BUCKET_DELETE)) {
            throw new ForbiddenError();
        }

        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
            throw new ForbiddenError();
        }
    }

    const { id: entityId } = entity;

    const minio = useMinio();
    await minio.removeBucket(toBucketName(entityId));

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
