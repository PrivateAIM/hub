/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import type { DataSource } from 'typeorm';
import { EventEntity } from '../../../../database/index.ts';

export async function deleteEventRouteHandler(req: Request, res: Response, dataSource: DataSource) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.EVENT_DELETE });

    const repository = dataSource.getRepository(EventEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (entity.realm_id) {
        const realm = useRequestIdentityRealm(req);
        if (!isRealmResourceWritable(realm, entity.realm_id)) {
            throw new ForbiddenError('You are not permitted to delete this event.');
        }
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    // -------------------------------------------

    return sendAccepted(res, entity);
}
