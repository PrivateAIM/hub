/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { isUUID } from '@authup/kit';
import { NotFoundError } from '@ebec/http';
import { DirectComponentCaller } from '@privateaim/server-kit';
import type { BucketFileCreationFinishedEventPayload } from '@privateaim/server-storage-kit';
import {
    BucketFileCommand, BucketFileEvent,
    BucketFileEventCaller,
} from '@privateaim/server-storage-kit';
import Busboy from 'busboy';
import path from 'node:path';
import { sendCreated, useRequestParam } from 'routup';
import type { Request, Response } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityOrFail } from '@privateaim/server-http-kit';
import { useBucketFileComponent } from '../../../../components/index.ts';
import { streamToBuffer } from '../../../../core/index.ts';
import type { BucketFileEntity } from '../../../../database/index.ts';
import {
    BucketEntity,
} from '../../../../database/index.ts';

export async function uploadRequestFilesToBucket(req: Request, bucket: BucketEntity) {
    const instance = Busboy({
        headers: req.headers,
        preservePath: true,
    });

    const actor = useRequestIdentityOrFail(req);

    const component = useBucketFileComponent();
    const caller = new DirectComponentCaller(component);
    const responseCaller = new BucketFileEventCaller();

    const identity = useRequestIdentityOrFail(req);

    return new Promise<BucketFileEntity[]>((resolve, reject) => {
        const entries : Promise<BucketFileEntity>[] = [];

        instance.on('file', (_, file, info) => {
            if (typeof info.filename === 'undefined') {
                return;
            }

            const promise = new Promise<BucketFileEntity>(
                (
                    fileResolve,
                    fileReject,
                ) => {
                    streamToBuffer(file)
                        .then((buffer) => {
                            caller.callWith(
                                BucketFileCommand.CREATE,
                                {
                                    meta: {
                                        actor_type: actor.type,
                                        actor_id: actor.id,
                                        name: path.basename(info.filename),
                                        path: info.filename,
                                        size: buffer.length,
                                        directory: path.dirname(info.filename),
                                        realm_id: identity.realmId,
                                        bucket_id: bucket.id,
                                        bucket,
                                    },
                                    data: buffer,
                                },
                                {

                                },
                                {
                                    handle: async (childValue, childContext) => {
                                        await responseCaller.call(
                                            childContext.key,
                                            childValue,
                                            childContext.metadata,
                                        );

                                        if (childContext.key === BucketFileEvent.CREATION_FINISHED) {
                                            fileResolve(childValue as BucketFileCreationFinishedEventPayload);
                                        }

                                        if (childContext.key === BucketFileEvent.CREATION_FAILED) {
                                            fileReject(childValue);
                                        }
                                    },
                                },
                            )
                                .catch((e) => fileReject(e));
                        })
                        .catch((e) => fileReject(e));
                },
            );

            entries.push(promise);
        });

        instance.on('error', (err) => {
            req.unpipe(instance);

            reject(err);
        });

        instance.on('finish', async () => {
            Promise.all(entries)
                .then((value) => resolve(value))
                .catch((e) => reject(e));
        });

        req.pipe(instance);
    });
}

export async function executeBucketRouteUploadHandler(req: Request, res: Response) : Promise<any> {
    // todo: check permissions by membership
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

    const files = await uploadRequestFilesToBucket(req, entity);

    return sendCreated(res, {
        data: files,
        meta: {
            total: files.length,
        },
    });
}
