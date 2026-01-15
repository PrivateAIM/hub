/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import {
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { DirectComponentCaller } from '@privateaim/server-kit';
import { BucketCommand } from '@privateaim/server-storage-kit';
import { BucketEntity } from '../../../../database/index.ts';
import {
    isBucketOwnedByIdentity,
} from '../../../../domains/index.ts';
import { useBucketComponent } from '../../../../components/index.ts';

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

    const actor = useRequestIdentityOrFail(req);
    if (!isBucketOwnedByIdentity(entity, actor)) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheck({ name: PermissionName.BUCKET_DELETE });

        if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
            throw new ForbiddenError();
        }
    }

    const component = useBucketComponent();
    const caller = new DirectComponentCaller(component);

    const output = await caller.callAndWait(
        BucketCommand.DELETE,
        {
            id: entity.id,
        },
        {},
    );

    if (output.deletionFinished) {
        return sendAccepted(res, output.creationFinished);
    }

    let error : Error;

    if (output.deletionFailed) {
        error = output.creationFailed.error;
    } else {
        error = new BadRequestError('Bucket could not be created.');
    }

    throw error;
}
