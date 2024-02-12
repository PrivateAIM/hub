/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Request, Response } from 'routup';
import { useRequestParam } from 'routup';
import tar from 'tar-stream';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/core';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../../../../config';
import { streamToBuffer, useMinio } from '../../../../../core';
import {
    AnalysisEntity, AnalysisFileEntity, AnalysisNodeEntity, generateAnalysisMinioBucketName,
} from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function handleAnalysisFilesDownloadRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        const analysisNodes = await dataSource.getRepository(AnalysisNodeEntity).find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        let isPermitted = false;

        for (let i = 0; i < analysisNodes.length; i++) {
            if (isRealmResourceReadable(useRequestEnv(req, 'realm'), analysisNodes[i].node.realm_id)) {
                isPermitted = true;
                break;
            }
        }

        if (!isPermitted) {
            throw new ForbiddenError('You are not allowed to inspect the analysis files.');
        }
    }

    res.writeHead(200, {
        'Content-Type': 'application/x-tar',
        'Transfer-Encoding': 'chunked',
    });

    const pack = tar.pack();
    pack.pipe(res);

    const minio = useMinio();

    const bucketName = generateAnalysisMinioBucketName(entity.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        pack.finalize();

        return;
    }

    const files = await dataSource.getRepository(AnalysisFileEntity).findBy({
        analysis_id: entity.id,
    });

    if (files.length === 0) {
        pack.finalize();

        return;
    }

    const promises : Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
        const promise = new Promise<void>((resolve, reject) => {
            const file = files[i];

            minio.getObject(bucketName, file.hash)
                .then((stream) => streamToBuffer(stream))
                .then((data) => {
                    let name = '';

                    if (
                        file.directory !== '.' &&
                        file.directory
                    ) {
                        name = `${file.directory}/`;
                    }

                    name += file.name;

                    useLogger().debug(`Packing analysis file ${name} (${data.byteLength} bytes) for streaming.`);

                    pack.entry({
                        name,
                        size: data.byteLength,
                    }, data, (err) => {
                        if (err) {
                            useLogger().error(`Packing analysis file ${name} for streaming failed.`);
                            reject(err);

                            return;
                        }

                        useLogger().debug(`Packed analysis file ${name} for streaming.`);
                        resolve();
                    });
                })
                .catch((e) => reject(e));
        });

        promises.push(promise);
    }

    await Promise.all(promises);

    pack.finalize();
}
