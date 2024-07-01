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
import { useRequestEnv } from '@privateaim/server-http-kit';
import { useMinio } from '../../../../core';
import { BucketEntity, getActorFromRequest, toBucketName } from '../../../../domains';
import { runBucketValidation } from '../utils/validation';

export async function executeBucketRouteCreateHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');
    if (!ability.has(PermissionName.BUCKET_CREATE)) {
        throw new ForbiddenError();
    }

    const actor = getActorFromRequest(req);
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
