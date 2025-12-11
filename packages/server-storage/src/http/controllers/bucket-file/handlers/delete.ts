/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import {
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { useMinio } from '../../../../core';
import { BucketFileEntity } from '../../../../database';
import {
    isBucketFileOwnedByIdentity,
    isBucketOwnedByIdentity,
    toBucketName,
} from '../../../../domains';

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

    const actor = useRequestIdentityOrFail(req);
    if (
        !isBucketOwnedByIdentity(entity.bucket, actor) &&
        !isBucketFileOwnedByIdentity(entity, actor)
    ) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheck({ name: PermissionName.BUCKET_UPDATE });

        if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
            throw new ForbiddenError();
        }
    }

    const minio = useMinio();
    await minio.removeObject(toBucketName(entity.bucket.id), entity.hash);

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
