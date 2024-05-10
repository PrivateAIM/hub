/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { isUUID } from '@authup/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import Busboy from 'busboy';
import crypto from 'node:crypto';
import path from 'node:path';
import { sendCreated, useRequestParam } from 'routup';
import type { Request, Response } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { streamToBuffer, useMinio } from '../../../../core';
import { BucketEntity, BucketFileEntity, getActorFromRequest } from '../../../../domains';
import { useRequestEnv } from '../../../request';

export async function uploadRequestFiles(req: Request, bucketName: string) {
    const minio = useMinio();

    const instance = Busboy({
        headers: req.headers,
        preservePath: true,
    });

    return new Promise<BucketFileEntity[]>((resolve, reject) => {
        const files : BucketFileEntity[] = [];
        const promises : Promise<void>[] = [];
        instance.on('file', (_, file, info) => {
            if (typeof info.filename === 'undefined') {
                return;
            }

            const promise = new Promise<void>((fileResolve, fileReject) => {
                const hashBuilder = crypto.createHash('sha256');
                hashBuilder.update(info.filename);

                const hash = hashBuilder.digest('hex');

                streamToBuffer(file)
                    .then((buffer) => {
                        minio.putObject(
                            bucketName,
                            hash,
                            buffer,
                            buffer.length,
                        )
                            .then(() => {
                                files.push({
                                    name: path.basename(info.filename),
                                    path: info.filename,
                                    hash,
                                    size: buffer.length,
                                    directory: path.dirname(info.filename),
                                    realm_id: useRequestEnv(req, 'realmId'),
                                } satisfies Partial<BucketFileEntity> as BucketFileEntity);

                                fileResolve();
                            })
                            .catch((e) => fileReject(e));
                    })
                    .catch((e) => fileReject(e));
            });

            promises.push(promise);
        });

        instance.on('error', (err) => {
            req.unpipe(instance);

            reject(err);
        });

        instance.on('finish', async () => {
            Promise.all(promises)
                .then(() => resolve(files))
                .catch((e) => reject(e));
        });

        req.pipe(instance);
    });
}

export async function executeBucketRouteUploadHandler(req: Request, res: Response) : Promise<any> {
    const actor = getActorFromRequest(req);
    if (!actor) {
        throw new ForbiddenError('Only users and robots are permitted to upload bucket files.');
    }

    // todo: check permissions by membership
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const query = repository.createQueryBuilder('bucket');
    if (isUUID(id)) {
        query.where('bucket.id LIKE :id', { id });
    } else {
        query.where('bucket.name LIKE :name', { name: id });
    }
    const entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    let files = await uploadRequestFiles(req, entity.name);

    if (files.length > 0) {
        files = files.map((file) => ({
            ...file,
            actor_type: actor.type,
            actor_id: actor.id,
            bucket_id: entity.id,
        }));

        const fileRepository = dataSource.getRepository(BucketFileEntity);
        await fileRepository.save(files, { listeners: true });
    }

    return sendCreated(res, {
        data: files,
        meta: {
            total: files.length,
        },
    });
}
