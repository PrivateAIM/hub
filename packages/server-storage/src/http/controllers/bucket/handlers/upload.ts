/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { NotFoundError } from '@ebec/http';
import Busboy from 'busboy';
import crypto from 'node:crypto';
import path from 'node:path';
import { send, sendCreated, useRequestParam } from 'routup';
import type { Request, Response } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { streamToBuffer, useMinio } from '../../../../core';
import { BucketEntity, BucketFileEntity } from '../../../../domains';

export async function executeBucketRouteUploadHandler(req: Request, res: Response) : Promise<any> {
    // todo: check permissions by membership
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const entity = await repository.findOneBy({ id });
    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const fileRepository = dataSource.getRepository(BucketFileEntity);

    const minio = useMinio();

    const instance = Busboy({
        headers: req.headers,
        preservePath: true,
    });

    const files : BucketFileEntity[] = [];
    const promises : Promise<void>[] = [];
    instance.on('file', (fileName, file, info) => {
        if (typeof info.filename === 'undefined') {
            return;
        }

        const promise = new Promise<void>((resolve, reject) => {
            const hashBuilder = crypto.createHash('sha256');
            hashBuilder.update(info.filename);

            const hash = hashBuilder.digest('hex');

            streamToBuffer(file)
                .then((buffer) => {
                    minio.putObject(
                        entity.name,
                        hash,
                        buffer,
                        buffer.length,
                    )
                        .then(() => {
                            files.push(fileRepository.create({
                                name: fileName,
                                hash,
                                size: buffer.length,
                                directory: path.dirname(info.filename),
                                // todo: userid, realmId, missing
                            }));

                            resolve();
                        })
                        .catch((e) => reject(e));
                })
                .catch((e) => reject(e));
        });

        promises.push(promise);
    });

    instance.on('error', () => {
        req.unpipe(instance);

        res.statusCode = 400;
        send(res);
    });

    instance.on('finish', async () => {
        try {
            await Promise.all(promises);
        } catch (e) {
            res.statusCode = 400;
            await send(res);
            return;
        }

        if (files.length === 0) {
            await sendCreated(res, {
                data: [],
                meta: {
                    total: 0,
                },
            });
            return;
        }

        await fileRepository.save(files, { listeners: true });

        await sendCreated(res, {
            data: files,
            meta: {
                total: files.length,
            },
        });
    });

    req.pipe(instance);
}
