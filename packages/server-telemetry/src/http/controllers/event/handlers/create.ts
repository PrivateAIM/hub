/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionName, isRealmResourceWritable,
} from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { ForbiddenError } from '@ebec/http';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { EventValidator } from '@privateaim/telemetry-kit';
import {
    EventEntity,
} from '../../../../database/index.ts';

export async function createEventRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.EVENT_CREATE });

    const validator = new EventValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req);

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: EventEntity,
    });

    const realm = useRequestIdentityRealm(req);
    if (data.realm_id) {
        if (!isRealmResourceWritable(realm, data.realm_id)) {
            throw new ForbiddenError('You are not permitted to create this event.');
        }
    } else {
        data.realm_id = realm.id;
    }

    const repository = dataSource.getRepository(EventEntity);
    const entity = repository.create(data);

    // -----------------------------------------------------

    await repository.save(entity);

    return sendCreated(res, entity);
}
