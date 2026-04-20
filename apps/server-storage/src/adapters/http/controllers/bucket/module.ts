/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Bucket } from '@privateaim/storage-kit';
import type { Logger } from '@privateaim/server-kit';
import { DirectComponentCaller } from '@privateaim/server-kit';
import {
    ForceLoggedInMiddleware,
    HTTPHandlerOperation,
    useRequestIdentityOrFail,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import { BucketCommand } from '@privateaim/server-storage-kit';
import type { BucketFileEventCaller } from '@privateaim/server-storage-kit';
import {
    DBody,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import type { DataSource } from 'typeorm';
import type { Client } from 'minio';
import { applyQuery } from 'typeorm-extension';
import { BucketEntity, BucketFileEntity } from '../../../database/index.ts';
import { isBucketOwnedByIdentity, toBucketName } from '../../../../app/domains/bucket/utils.ts';
import type { BucketComponent } from '../../../../app/components/bucket/module.ts';
import type { BucketFileComponent } from '../../../../app/components/bucket-file/module.ts';
import { uploadRequestFilesToBucket } from './upload.ts';
import { BucketValidator } from './utils/validation.ts';
import { packBucketFiles } from './stream.ts';

type BucketCreate = Pick<Bucket, 'name' | 'region'>;
type BucketUpdate = BucketCreate;

@DTags('buckets')
@DController('/buckets')
export class BucketController {
    private dataSource: DataSource;

    private minio: Client;

    private bucketComponent: BucketComponent;

    private bucketFileComponent: BucketFileComponent;

    private bucketFileEventCaller: BucketFileEventCaller;

    private logger: Logger | undefined;

    constructor(ctx: {
        dataSource: DataSource;
        minio: Client;
        bucketComponent: BucketComponent;
        bucketFileComponent: BucketFileComponent;
        bucketFileEventCaller: BucketFileEventCaller;
        logger?: Logger;
    }) {
        this.dataSource = ctx.dataSource;
        this.minio = ctx.minio;
        this.bucketComponent = ctx.bucketComponent;
        this.bucketFileComponent = ctx.bucketFileComponent;
        this.bucketFileEventCaller = ctx.bucketFileEventCaller;
        this.logger = ctx.logger;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
        const repository = this.dataSource.getRepository(BucketEntity);
        const query = repository.createQueryBuilder('bucket');
        query.groupBy('bucket.id');

        const { pagination } = applyQuery(query, useRequestQuery(req), {
            defaultAlias: 'bucket',
            fields: {
                default: [
                    'id',
                    'name',
                    'region',
                    'created_at',
                    'updated_at',
                    'realm_id',
                    'actor_id',
                    'actor_type',
                ],
            },
            filters: { allowed: ['id', 'name', 'realm_id', 'actor_type', 'actor_id'] },
            pagination: { maxLimit: 50 },
            sort: { allowed: ['id', 'updated_at', 'created_at'] },
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
        const repository = this.dataSource.getRepository(BucketEntity);
        const query = repository.createQueryBuilder('bucket');
        if (isUUID(id)) {
            query.where('bucket.id = :id', { id });
        } else {
            query.where('bucket.name = :name', { name: id });
        }
        const entity = await query.getOne();
        if (!entity) {
            throw new NotFoundError();
        }

        const fileRepository = this.dataSource.getRepository(BucketFileEntity);
        const files = await fileRepository.findBy({ bucket_id: entity.id });

        res.writeHead(200, {
            'Content-Type': 'application/x-tar',
            'Transfer-Encoding': 'chunked',
        });

        const bucketName = toBucketName(entity.id);

        this.logger?.debug(`Streaming files of ${bucketName}`);

        try {
            await packBucketFiles(res, bucketName, files, this.minio, this.logger);

            this.logger?.debug(`Streamed files of ${bucketName}`);
        } catch (err) {
            this.logger?.error(err);

            if (!res.writableEnded) {
                res.destroy(err instanceof Error ? err : undefined);
            }
        }
    }

    @DPost('/:id/upload', [ForceLoggedInMiddleware])
    async upload(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const repository = this.dataSource.getRepository(BucketEntity);
        const query = repository.createQueryBuilder('bucket');
        if (isUUID(id)) {
            query.where('bucket.id = :id', { id });
        } else {
            query.where('bucket.name = :name', { name: id });
        }
        const entity = await query.getOne();
        if (!entity) {
            throw new NotFoundError();
        }

        const files = await uploadRequestFilesToBucket(req, entity, this.bucketFileComponent, this.bucketFileEventCaller);

        res.statusCode = 201;
        return {
            data: files,
            meta: { total: files.length },
        };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
    ) {
        const repository = this.dataSource.getRepository(BucketEntity);
        const query = repository.createQueryBuilder('bucket');

        if (isUUID(id)) {
            query.where('bucket.id = :id', { id });
        } else {
            query.where('bucket.name = :name', { name: id });
        }

        applyQuery(query, useRequestQuery(req), {
            defaultAlias: 'bucket',
            fields: {
                default: [
                    'id',
                    'name',
                    'region',
                    'created_at',
                    'updated_at',
                    'realm_id',
                    'actor_type',
                    'actor_id',
                ],
            },
        });

        const entity = await query.getOne();

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
        @DBody() data: BucketUpdate,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const validator = new BucketValidator();
        const validatorAdapter = new RoutupContainerAdapter(validator);
        const validated = await validatorAdapter.run(req, { group: HTTPHandlerOperation.UPDATE });

        const repository = this.dataSource.getRepository(BucketEntity);
        const query = repository.createQueryBuilder('bucket');
        if (isUUID(id)) {
            query.where('bucket.id = :id', { id });
        } else {
            query.where('bucket.name = :name', { name: id });
        }
        let entity = await query.getOne();
        if (!entity) {
            throw new NotFoundError();
        }

        const actor = useRequestIdentityOrFail(req);
        if (!isBucketOwnedByIdentity(entity, actor)) {
            const permissionChecker = useRequestPermissionChecker(req);
            await permissionChecker.preCheck({ name: PermissionName.BUCKET_UPDATE });

            if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
                throw new ForbiddenError();
            }
        }

        entity = repository.merge(entity, validated);

        await repository.save(entity);

        const bucketName = toBucketName(entity.id);
        const hasBucket = await this.minio.bucketExists(bucketName);
        if (!hasBucket) {
            if (entity.region) {
                await this.minio.makeBucket(bucketName, entity.region);
            } else {
                await this.minio.makeBucket(bucketName);
            }
        }

        res.statusCode = 202;
        return entity;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: BucketCreate,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheck({ name: PermissionName.BUCKET_CREATE });

        const actor = useRequestIdentityOrFail(req);
        if (!actor) {
            throw new ForbiddenError('Only clients, users & robots are permitted to create a bucket.');
        }

        const validator = new BucketValidator();
        const validatorAdapter = new RoutupContainerAdapter(validator);
        const validated = await validatorAdapter.run(req, { group: HTTPHandlerOperation.CREATE });

        const realm = useRequestIdentityRealm(req);
        if (validated.realm_id) {
            if (!isRealmResourceWritable(realm, validated.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this bucket.');
            }
        } else {
            validated.realm_id = realm.id;
        }

        const caller = new DirectComponentCaller(this.bucketComponent);

        const output = await caller.callAndWait(
            BucketCommand.CREATE,
            {
                actor_id: actor.id,
                actor_type: actor.type,
                ...validated,
            },
            {},
        );

        if (output.creationFinished) {
            res.statusCode = 201;
            return output.creationFinished;
        }

        let error : Error;

        if (output.creationFailed) {
            error = output.creationFailed.error;
        } else {
            error = new BadRequestError('Bucket could not be created.');
        }

        throw error;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const repository = this.dataSource.getRepository(BucketEntity);
        const query = repository.createQueryBuilder('bucket');
        if (isUUID(id)) {
            query.where('bucket.id = :id', { id });
        } else {
            query.where('bucket.name = :name', { name: id });
        }

        const entity = await query.getOne();
        if (!entity) {
            throw new NotFoundError();
        }

        const actor = useRequestIdentityOrFail(req);
        if (!isBucketOwnedByIdentity(entity, actor)) {
            const permissionChecker = useRequestPermissionChecker(req);
            await permissionChecker.preCheck({ name: PermissionName.BUCKET_DELETE });

            if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
                throw new ForbiddenError();
            }
        }

        const caller = new DirectComponentCaller(this.bucketComponent);

        const output = await caller.callAndWait(
            BucketCommand.DELETE,
            { id: entity.id },
            {},
        );

        if (output.deletionFinished) {
            res.statusCode = 202;
            return output.deletionFinished;
        }

        let error : Error;

        if (output.deletionFailed) {
            error = output.deletionFailed.error;
        } else {
            error = new BadRequestError('Bucket could not be deleted.');
        }

        throw error;
    }
}
