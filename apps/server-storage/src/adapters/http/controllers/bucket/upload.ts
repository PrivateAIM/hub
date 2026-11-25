/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';
import {
    BucketFileCommand,
    type BucketFileCreationFinishedEventPayload,
    BucketFileEvent,
    type BucketFileEventDispatcher,
} from '@privateaim/server-storage-kit';
import Busboy from 'busboy';
import path from 'node:path';
import type { IAppEvent } from 'routup';
import { assertRequestContentType } from 'routup';
import { BadRequestError } from '@privateaim/errors';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import type { BucketEntity } from '../../../database/index.ts';
import type { BucketFileUploader } from './types.ts';

export async function uploadRequestFilesToBucket(
    event: IAppEvent,
    bucket: BucketEntity,
    uploader: BucketFileUploader,
    bucketFileComponent: BucketFileComponent,
    bucketFileEventDispatcher?: BucketFileEventDispatcher,
) {
    // 415 for a missing or other type, 400 for a malformed header.
    assertRequestContentType(event, 'multipart/form-data');

    // the full header: Busboy reads the boundary parameter.
    const contentType = event.headers.get('content-type') ?? '';

    if (!event.request.body) {
        throw new BadRequestError('The request body is empty.');
    }

    const instance = Busboy({
        headers: { 'content-type': contentType },
        preservePath: true,
    });

    return new Promise<BucketFileCreationFinishedEventPayload[]>((resolve, reject) => {
        const entries : Promise<BucketFileCreationFinishedEventPayload>[] = [];

        instance.on('file', (_, file, info) => {
            // An abort destroys the file stream with an error, possibly before
            // the create handler pipes it (it awaits the data source first).
            // Without a listener that error is uncaught; the handler still
            // sees it, as its pipeline rejects on an errored stream.
            file.on('error', () => {});

            if (typeof info.filename === 'undefined') {
                file.resume();

                return;
            }

            const promise = new Promise<BucketFileCreationFinishedEventPayload>(
                (
                    fileResolve,
                    fileReject,
                ) => {
                    bucketFileComponent.handle(
                        BucketFileCommand.CREATE,
                        {
                            meta: {
                                id: randomUUID(),
                                actorType: uploader.type,
                                actorId: uploader.id,
                                name: path.basename(info.filename),
                                path: info.filename,
                                directory: path.dirname(info.filename),
                                realmId: uploader.realmId,
                                bucketId: bucket.id,
                                bucket,
                            },
                            data: file,
                        },
                        // one correlationId for every event of this command
                        { correlationId: randomUUID() },
                        {
                            handle: async (childValue, childContext) => {
                                await bucketFileEventDispatcher?.dispatch(
                                    childContext.key,
                                    childValue,
                                    childContext.metadata,
                                );

                                if (childContext.key === BucketFileEvent.CREATION_FINISHED) {
                                    fileResolve(childValue as BucketFileCreationFinishedEventPayload);

                                    return;
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

        // pipeline, not pipe: when the client aborts the upload, the request
        // stream errors, busboy is destroyed with it and fails the open file
        // stream, so neither this promise nor a storage write hangs.
        pipeline(Readable.fromWeb(event.request.body as ReadableStream), instance)
            .catch(async (e) => {
                // 'finish' never comes: settle the file writes still open
                // before failing the request.
                await Promise.allSettled(entries);

                reject(e);
            });
    });
}
