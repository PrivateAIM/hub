/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DirectComponentCaller } from '@privateaim/server-kit';
import {
    BucketFileCommand,
    type BucketFileCreationFinishedEventPayload,
    BucketFileEvent,
    type BucketFileEventCaller,
} from '@privateaim/server-storage-kit';
import Busboy from 'busboy';
import path from 'node:path';
import type { Request } from 'routup';
import { useRequestIdentityOrFail } from '@privateaim/server-http-kit';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import { streamToBuffer } from '../../../../core/utils/stream-to-buffer.ts';
import type { BucketEntity, BucketFileEntity  } from '../../../database/index.ts';

export async function uploadRequestFilesToBucket(
    req: Request,
    bucket: BucketEntity,
    bucketFileComponent: BucketFileComponent,
    bucketFileEventCaller: BucketFileEventCaller,
) {
    const instance = Busboy({
        headers: req.headers,
        preservePath: true,
    });

    const actor = useRequestIdentityOrFail(req);

    const caller = new DirectComponentCaller(bucketFileComponent);

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
                                {},
                                {
                                    handle: async (childValue, childContext) => {
                                        await bucketFileEventCaller.call(
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
