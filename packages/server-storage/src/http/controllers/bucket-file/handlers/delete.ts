/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import {
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { DirectComponentCaller } from '@privateaim/server-kit';
import type { BucketFileDeletionFinishedEventPayload } from '@privateaim/server-storage-kit';
import {
    BucketFileCommand,
    BucketFileEvent,
    BucketFileEventCaller,
} from '@privateaim/server-storage-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useBucketFileComponent } from '../../../../components/index.ts';
import { BucketFileEntity } from '../../../../database/index.ts';
import { isBucketFileOwnedByIdentity, isBucketOwnedByIdentity } from '../../../../domains/index.ts';

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

    const component = useBucketFileComponent();
    const caller = new DirectComponentCaller(component);
    const responseCaller = new BucketFileEventCaller();

    await new Promise((resolve, reject) => {
        caller.callWith(
            BucketFileCommand.DELETE,
            {
                id: entity.id,
            },
            {},
            {
                handle: async (childValue, childContext) => {
                    await responseCaller.call(
                        childContext.key,
                        childValue,
                        childContext.metadata,
                    );

                    if (childContext.key === BucketFileEvent.DELETION_FINISHED) {
                        resolve(childValue as BucketFileDeletionFinishedEventPayload);
                    }

                    if (childContext.key === BucketFileEvent.DELETION_FAILED) {
                        reject(childValue);
                    }
                },
            },
        );
    });

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
