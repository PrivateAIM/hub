/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { pipeline } from 'node:stream';
import { createGzip } from 'node:zlib';
import { NotFoundError } from '@ebec/http';
import { useLogger } from '@privateaim/server-kit';
import type { Request, Response } from 'routup';
import { getRequestAcceptableEncoding, setResponseHeaderAttachment, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import {
    BucketFileEntity, toBucketName,
} from '../../../../domains';

export async function executeBucketFileRouteStreamHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketFileEntity);
    const entity = await repository.findOneBy({
        id,
    });

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

    setResponseHeaderAttachment(res, entity.name);

    const bucketName = toBucketName(entity.bucket_id);

    useLogger().debug(`Streaming file ${entity.hash} (${id}) of ${bucketName}`);

    const minio = useMinio();
    const stream = await minio.getObject(bucketName, entity.hash);
    stream.on('end', () => {
        useLogger().debug(`Streamed file ${entity.hash} (${id}) of ${bucketName}`);
    });
    stream.on('error', (err) => {
        useLogger().error(err);
    });

    if (gzipSupported) {
        const gzip = createGzip();
        pipeline(stream, gzip, res);
    } else {
        stream.pipe(res);
    }
}
