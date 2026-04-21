/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createGzip } from 'node:zlib';
import { NotFoundError } from '@ebec/http';
import type { Logger } from '@privateaim/server-kit';
import {
    DController,
    DDelete,
    DGet,
    DPath,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { Request, Response } from 'routup';
import { getRequestAcceptableEncoding } from 'routup';
import type { Client } from 'minio';
import type { IBucketFileRepository, IBucketFileService } from '../../../../core/entities/index.ts';
import { buildActorContext } from '../../request/index.ts';

type BucketFileControllerContext = {
    service: IBucketFileService;
    bucketFileRepository: IBucketFileRepository;
    minio: Client;
    logger?: Logger;
};

@DTags('buckets')
@DController('/bucket-files')
export class BucketFileController {
    protected service: IBucketFileService;

    protected bucketFileRepository: IBucketFileRepository;

    protected minio: Client;

    protected logger: Logger | undefined;

    constructor(ctx: BucketFileControllerContext) {
        this.service = ctx.service;
        this.bucketFileRepository = ctx.bucketFileRepository;
        this.minio = ctx.minio;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const entity = await this.bucketFileRepository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        const gzipSupported = getRequestAcceptableEncoding(req, 'gzip');
        if (gzipSupported) {
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Encoding': 'gzip',
            });
        } else {
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Encoding': 'identity',
            });
        }

        const bucketName = entity.bucket_id.toLowerCase().replace(/[^a-z0-9.-]/g, '').substring(0, 63);

        this.logger?.debug(`Streaming file ${entity.hash} (${id}) of ${bucketName}`);

        const stream = await this.minio.getObject(bucketName, entity.hash);
        stream.on('end', () => {
            this.logger?.debug(`Streamed file ${entity.hash} (${id}) of ${bucketName}`);
        });
        stream.on('error', (err) => {
            this.logger?.error(err);
        });

        if (gzipSupported) {
            stream
                .pipe(createGzip())
                .pipe(res);
        } else {
            stream.pipe(res);
        }
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
    ) {
        const query = useRequestQuery(req);
        return this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        res.statusCode = 202;
        return entity;
    }
}
