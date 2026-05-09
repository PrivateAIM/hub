/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Readable } from 'node:stream';
import { createGzip } from 'node:zlib';
import { NotFoundError } from '@ebec/http';
import type { BucketFile } from '@privateaim/storage-kit';
import type { Logger } from '@privateaim/server-kit';
import {
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IRoutupEvent } from 'routup';
import { getRequestAcceptableEncoding } from 'routup';
import type { IStorageAdapter } from '../../../../core/storage/types.ts';
import type { IBucketFileRepository, IBucketFileService } from '../../../../core/entities/index.ts';
import { toBucketName } from '../../../../core/utils/bucket-name.ts';
import { buildActorContext } from '../../request/index.ts';

type BucketFileControllerContext = {
    service: IBucketFileService;
    bucketFileRepository: IBucketFileRepository;
    storage: IStorageAdapter;
    logger?: Logger;
};

@DTags('buckets')
@DController('/bucket-files')
export class BucketFileController {
    protected service: IBucketFileService;

    protected bucketFileRepository: IBucketFileRepository;

    protected storage: IStorageAdapter;

    protected logger: Logger | undefined;

    constructor(ctx: BucketFileControllerContext) {
        this.service = ctx.service;
        this.bucketFileRepository = ctx.bucketFileRepository;
        this.storage = ctx.storage;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IRoutupEvent,
    ) {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ) {
        const entity = await this.bucketFileRepository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        const gzipSupported = getRequestAcceptableEncoding(event, 'gzip');

        const bucketName = toBucketName(entity.bucket_id);

        this.logger?.debug(`Streaming file ${entity.hash} (${id}) of ${bucketName}`);

        const nodeStream = await this.storage.getObject(bucketName, entity.hash);
        nodeStream.on('end', () => {
            this.logger?.debug(`Streamed file ${entity.hash} (${id}) of ${bucketName}`);
        });
        nodeStream.on('error', (err) => {
            this.logger?.error(err);
        });

        if (gzipSupported) {
            const gzipped = nodeStream.pipe(createGzip());
            const webStream = Readable.toWeb(gzipped) as ReadableStream;

            return new Response(webStream, {
                status: 200,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Encoding': 'gzip',
                },
            });
        }

        const webStream = Readable.toWeb(nodeStream) as ReadableStream;

        return new Response(webStream, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Encoding': 'identity',
            },
        });
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<BucketFile> {
        const query = useRequestQuery(event);
        return this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<BucketFile> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
