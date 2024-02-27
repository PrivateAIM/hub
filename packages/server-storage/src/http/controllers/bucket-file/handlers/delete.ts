/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@privateaim/core';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import {
    BucketFileEntity,
    getActorFromRequest,
    isBucketFileOwnedByActor,
    isBucketOwnedByActor,
} from '../../../../domains';
import { useRequestEnv } from '../../../request';

export async function executeBucketFileRouteDeleteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketFileEntity);
    const entity = await repository.findOne({
        where: {
            id,
        },
        relations: ['bucket'],
    });

    if (!entity) {
        throw new NotFoundError();
    }

    const actor = getActorFromRequest(req);
    if (
        !isBucketOwnedByActor(entity.bucket, actor) &&
        !isBucketFileOwnedByActor(entity, actor)
    ) {
        const ability = useRequestEnv(req, 'ability');
        if (!ability.has(PermissionID.BUCKET_EDIT)) {
            throw new ForbiddenError();
        }

        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
            throw new ForbiddenError();
        }
    }

    const minio = useMinio();
    await minio.removeObject(entity.bucket.name, entity.hash);

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
