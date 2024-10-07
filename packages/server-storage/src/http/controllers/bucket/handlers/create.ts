/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import { ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityOrFail, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { useMinio } from '../../../../core';
import { BucketEntity, toBucketName } from '../../../../domains';
import { runBucketValidation } from '../utils/validation';

export async function executeBucketRouteCreateHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.BUCKET_CREATE });

    const actor = useRequestIdentityOrFail(req);
    if (!actor) {
        throw new ForbiddenError('Only users and robots are permitted to create a bucket.');
    }

    const result = await runBucketValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const entity = repository.create({
        actor_id: actor.id,
        actor_type: actor.type,
        ...result.data,
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
