/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createGzip } from 'node:zlib';
import { NotFoundError } from '@ebec/http';
import { useLogger } from '@privateaim/server-kit';
import type { Request, Response } from 'routup';
import { getRequestAcceptableEncoding, useRequestParam } from 'routup';
import type { DataSource } from 'typeorm';
import type { Client } from 'minio';
import { BucketFileEntity } from '../../../../database/index.ts';
import {
    toBucketName,
} from '../../../../../app/domains/bucket/utils.ts';

export async function executeBucketFileRouteStreamHandler(
    req: Request,
    res: Response,
    dataSource: DataSource,
    minio: Client,
) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const repository = dataSource.getRepository(BucketFileEntity);
    const entity = await repository.findOneBy({ id });

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

    const bucketName = toBucketName(entity.bucket_id);

    useLogger().debug(`Streaming file ${entity.hash} (${id}) of ${bucketName}`);

    const stream = await minio.getObject(bucketName, entity.hash);
    stream.on('end', () => {
        useLogger().debug(`Streamed file ${entity.hash} (${id}) of ${bucketName}`);
    });
    stream.on('error', (err) => {
        useLogger().error(err);
    });

    if (gzipSupported) {
        stream
            .pipe(createGzip())
            .pipe(res);
    } else {
        stream.pipe(res);
    }
}
