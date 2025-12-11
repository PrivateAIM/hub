/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import {
    HTTPHandlerOperation,
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { DirectComponentCaller } from '@privateaim/server-kit';
import { BucketCommand } from '@privateaim/server-storage-kit';
import { BucketValidator } from '../utils/validation';
import { useBucketComponent } from '../../../../components';

export async function executeBucketRouteCreateHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.BUCKET_CREATE });

    const actor = useRequestIdentityOrFail(req);
    if (!actor) {
        throw new ForbiddenError('Only users and robots are permitted to create a bucket.');
    }

    const validator = new BucketValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const realm = useRequestIdentityRealm(req);
    if (data.realm_id) {
        if (!isRealmResourceWritable(realm, data.realm_id)) {
            throw new ForbiddenError('You are not permitted to create this bucket.');
        }
    } else {
        data.realm_id = realm.id;
    }

    const component = useBucketComponent();
    const caller = new DirectComponentCaller(component);

    const output = await caller.callAndWait(
        BucketCommand.CREATE,
        {
            actor_id: actor.id,
            actor_type: actor.type,
            ...data,
        },
        {},
    );

    if (output.creationFinished) {
        return sendCreated(res, output.creationFinished);
    }

    let error : Error;

    if (output.creationFailed) {
        error = output.creationFailed.error;
    } else {
        error = new BadRequestError('Bucket could not be created.');
    }

    throw error;
}
