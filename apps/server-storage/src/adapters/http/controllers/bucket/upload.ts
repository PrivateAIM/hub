/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { DirectComponentCaller } from '@privateaim/server-kit';
import {
    BucketFileCommand,
    type BucketFileCreationFinishedEventPayload,
    BucketFileEvent,
    type BucketFileEventCaller,
} from '@privateaim/server-storage-kit';
import Busboy from 'busboy';
import path from 'node:path';
import type { IAppEvent } from 'routup';
import { BadRequestError } from '@privateaim/errors';
import { useRequestIdentityOrFail } from '@privateaim/server-http-kit';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import type { BucketEntity } from '../../../database/index.ts';

export async function uploadRequestFilesToBucket(
    event: IAppEvent,
    bucket: BucketEntity,
    bucketFileComponent: BucketFileComponent,
    bucketFileEventCaller: BucketFileEventCaller,
) {
    const contentType = event.headers.get('content-type');
    if (!contentType || !contentType.startsWith('multipart/')) {
        throw new BadRequestError('A multipart content-type header is required.');
    }

    if (!event.request.body) {
        throw new BadRequestError('The request body is empty.');
    }

    const instance = Busboy({
        headers: { 'content-type': contentType },
        preservePath: true,
    });

    const actor = useRequestIdentityOrFail(event);

    const caller = new DirectComponentCaller(bucketFileComponent);

    const identity = useRequestIdentityOrFail(event);

    return new Promise<BucketFileCreationFinishedEventPayload[]>((resolve, reject) => {
        const entries : Promise<BucketFileCreationFinishedEventPayload>[] = [];

        instance.on('file', (_, file, info) => {
            if (typeof info.filename === 'undefined') {
                file.resume();
                return;
            }

            const promise = new Promise<BucketFileCreationFinishedEventPayload>(
                (
                    fileResolve,
                    fileReject,
                ) => {
                    caller.callWith(
                        BucketFileCommand.CREATE,
                        {
                            meta: {
                                id: randomUUID(),
                                actor_type: actor.type,
                                actor_id: actor.id,
                                name: path.basename(info.filename),
                                path: info.filename,
                                directory: path.dirname(info.filename),
                                realm_id: identity.realmId,
                                bucket_id: bucket.id,
                                bucket,
                            },
                            data: file,
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
                },
            );

            entries.push(promise);
        });

        instance.on('error', (err) => {
            reject(err);
        });

        instance.on('finish', async () => {
            Promise.all(entries)
                .then((value) => resolve(value))
                .catch((e) => reject(e));
        });

        Readable.fromWeb(event.request.body as ReadableStream).pipe(instance);
    });
}
