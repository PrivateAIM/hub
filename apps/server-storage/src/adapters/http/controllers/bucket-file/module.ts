/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createGzip } from 'node:zlib';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Logger } from '@privateaim/server-kit';
import { DirectComponentCaller } from '@privateaim/server-kit';
import {
    ForceLoggedInMiddleware,
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import {
    BucketFileCommand,
    type BucketFileDeletionFinishedEventPayload,
    BucketFileEvent,
    type BucketFileEventCaller,
} from '@privateaim/server-storage-kit';
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
import type { Request, Response } from 'routup';
import { getRequestAcceptableEncoding } from 'routup';
import type { DataSource } from 'typeorm';
import type { Client } from 'minio';
import { applyQuery } from 'typeorm-extension';
import { BucketFileEntity } from '../../../database/index.ts';
import { isBucketFileOwnedByIdentity } from '../../../../app/domains/bucket-file/utils.ts';
import { isBucketOwnedByIdentity, toBucketName } from '../../../../app/domains/bucket/utils.ts';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';

@DTags('buckets')
@DController('/bucket-files')
export class BucketFileController {
    private dataSource: DataSource;

    private minio: Client;

    private bucketFileComponent: BucketFileComponent;

    private bucketFileEventCaller: BucketFileEventCaller;

    private logger: Logger | undefined;

    constructor(ctx: {
        dataSource: DataSource;
        minio: Client;
        bucketFileComponent: BucketFileComponent;
        bucketFileEventCaller: BucketFileEventCaller;
        logger?: Logger;
    }) {
        this.dataSource = ctx.dataSource;
        this.minio = ctx.minio;
        this.bucketFileComponent = ctx.bucketFileComponent;
        this.bucketFileEventCaller = ctx.bucketFileEventCaller;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
        const repository = this.dataSource.getRepository(BucketFileEntity);
        const query = repository.createQueryBuilder('bucketFile');
        query.groupBy('bucketFile.id');

        const { pagination } = applyQuery(query, useRequestQuery(req), {
            defaultAlias: 'bucketFile',
            fields: {
                default: [
                    'id',
                    'name',
                    'path',
                    'directory',
                    'size',
                    'hash',
                    'created_at',
                    'updated_at',
                    'realm_id',
                    'actor_type',
                    'actor_id',
                    'bucket_id',
                ],
            },
            relations: {
                allowed: ['bucket'],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            filters: {
                allowed: [
                    'id',
                    'name',
                    'directory',
                    'realm_id',
                    'actor_type',
                    'actor_id',
                    'bucket_id',
                ],
            },
            pagination: { maxLimit: 50 },
            sort: { allowed: ['id', 'directory', 'name', 'updated_at', 'created_at'] },
        });

        const [entities, total] = await query.getManyAndCount();

        return {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        };
    }

    @DGet('/:id/stream', [ForceLoggedInMiddleware])
    async stream(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const repository = this.dataSource.getRepository(BucketFileEntity);
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
        const repository = this.dataSource.getRepository(BucketFileEntity);
        const query = repository.createQueryBuilder('bucketFile')
            .where('bucketFile.id = :id', { id });

        applyQuery(query, useRequestQuery(req), {
            defaultAlias: 'bucketFile',
            fields: {
                default: [
                    'id',
                    'name',
                    'path',
                    'directory',
                    'size',
                    'hash',
                    'created_at',
                    'updated_at',
                    'realm_id',
                    'actor_type',
                    'actor_id',
                    'bucket_id',
                ],
            },
            relations: { allowed: ['bucket'] },
        });

        const entity = await query.getOne();

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const repository = this.dataSource.getRepository(BucketFileEntity);
        const entity = await repository.findOne({
            where: { id },
            relations: ['bucket'],
        });

        if (!entity) {
            throw new NotFoundError();
        }

        const actor = useRequestIdentityOrFail(req);
        if (
            !isBucketOwnedByIdentity(entity.bucket, actor) &&
            !isBucketFileOwnedByIdentity(entity, actor)
        ) {
            const permissionChecker = useRequestPermissionChecker(req);
            await permissionChecker.preCheck({ name: PermissionName.BUCKET_UPDATE });

            if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
                throw new ForbiddenError();
            }
        }

        const caller = new DirectComponentCaller(this.bucketFileComponent);

        await new Promise((resolve, reject) => {
            caller.callWith(
                BucketFileCommand.DELETE,
                { id: entity.id },
                {},
                {
                    handle: async (childValue, childContext) => {
                        await this.bucketFileEventCaller.call(
                            childContext.key,
                            childValue,
                            childContext.metadata,
                        );

                        if (childContext.key === BucketFileEvent.DELETION_FINISHED) {
                            resolve(childValue as BucketFileDeletionFinishedEventPayload);
                        }

                        if (childContext.key === BucketFileEvent.DELETION_FAILED) {
                            reject(childValue);
                        }
                    },
                },
            );
        });

        const { id: entityId } = entity;

        await repository.remove(entity);

        entity.id = entityId;

        res.statusCode = 202;
        return entity;
    }
}
