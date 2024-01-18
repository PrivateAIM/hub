/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import crypto from 'node:crypto';
import type { AnalysisFile } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';
import type { FileInfo } from 'busboy';
import BusBoy from 'busboy';
import type { UploadedObjectInfo } from 'minio';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { send, sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ensureMinioBucket, useMinio } from '../../../../../core';
import { streamToBuffer } from '../../../../../core';
import { AnalysisEntity, generateAnalysisMinioBucketName } from '../../../../../domains';
import { AnalysisFileEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function uploadAnalysisFilesRouteHandler(req: Request, res: Response) {
    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionID.ANALYSIS_ADD) &&
        !ability.has(PermissionID.ANALYSIS_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository<AnalysisFile>(AnalysisFileEntity);

    const instance = BusBoy({ headers: req.headers, preservePath: true });

    const files: AnalysisFile[] = [];

    const minio = useMinio();

    let analysisId : string | undefined;
    instance.on('field', (name, value) => {
        if (name === 'analysis_id') {
            analysisId = value;
        }
    });

    const promises : Promise<UploadedObjectInfo>[] = [];
    instance.on('file', (filename, file, info: FileInfo) => {
        if (typeof info.filename === 'undefined' || typeof analysisId === 'undefined') {
            return;
        }

        const promise = new Promise<UploadedObjectInfo>((resolve, reject) => {
            const hash = crypto.createHash('sha256');

            hash.update(analysisId);
            hash.update(info.filename);

            const fileName: string = path.basename(info.filename);
            const filePath: string = path.dirname(info.filename);

            const destinationFileName = hash.digest('hex');

            streamToBuffer(file)
                .then((buffer) => {
                    const bucketName = generateAnalysisMinioBucketName(analysisId);
                    ensureMinioBucket(minio, bucketName)
                        .then(() => {
                            minio.putObject(
                                bucketName,
                                destinationFileName,
                                buffer,
                                buffer.length,
                            )
                                .then((minioInfo) => {
                                    const realm = useRequestEnv(req, 'realm');
                                    files.push(repository.create({
                                        hash: destinationFileName,
                                        name: fileName,
                                        size: buffer.length,
                                        directory: filePath,
                                        user_id: useRequestEnv(req, 'userId'),
                                        analysis_id: analysisId,
                                        realm_id: realm.id,
                                    }));

                                    resolve(minioInfo);
                                })
                                .catch((e) => reject(e));
                        })
                        .catch((e) => reject(e));
                })
                .catch((e) => reject(e));
        });

        promises.push(promise);
    });

    instance.on('error', () => {
        req.unpipe(instance);

        throw new BadRequestError();
    });

    instance.on('finish', async () => {
        await Promise.all(promises);

        if (typeof analysisId === 'undefined') {
            res.statusCode = 400;
            send(res);
            return;
        }

        const bucketName = generateAnalysisMinioBucketName(analysisId);
        const trainRepository = dataSource.getRepository(AnalysisEntity);
        const train = await trainRepository.findOneBy({ id: analysisId });
        if (!train) {
            const objectNames = files.map((file) => file.hash);
            if (objectNames.length > 0) {
                await minio.removeObjects(bucketName, objectNames);
            }

            await minio.removeBucket(bucketName);

            res.statusCode = 400;
            send(res);
            return;
        }

        if (files.length === 0) {
            sendCreated(res, {
                data: [],
                meta: {
                    total: 0,
                },
            });

            return;
        }

        await repository.save(files, { listeners: true });

        sendCreated(res, {
            data: files,
            meta: {
                total: files.length,
            },
        });
    });

    req.pipe(instance);
}
