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
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import { BucketFileEntity } from '../../../../database';
import {
    toBucketName,
} from '../../../../domains';

/*
function encodeContentDispositionFilename(input: string) {
    return input
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/Ä/g, 'Ae')
        .replace(/Ö/g, 'Oe')
        .replace(/Ü/g, 'Ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
}

 */

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

    // todo: use should be done in setResponseHeaderAttachment or as helper fn
    // setResponseHeaderAttachment(res, encodeContentDispositionFilename(entity.name));

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
        stream
            .pipe(createGzip())
            .pipe(res);
    } else {
        stream.pipe(res);
    }
}
