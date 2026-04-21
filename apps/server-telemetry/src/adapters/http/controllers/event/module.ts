/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { EventValidator } from '@privateaim/telemetry-kit';
import {
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
import { ForceLoggedInMiddleware, useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request, Response } from 'routup';
import type { DataSource } from 'typeorm';
import { applyQuery, validateEntityJoinColumns } from 'typeorm-extension';
import { EventEntity } from '../../../database/index.ts';

@DTags('events')
@DController('/events')
export class EventController {
    private dataSource: DataSource;

    constructor(ctx: { dataSource: DataSource }) {
        this.dataSource = ctx.dataSource;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheck({ name: PermissionName.EVENT_CREATE });

        const validator = new EventValidator();
        const validatorAdapter = new RoutupContainerAdapter(validator);
        const data = await validatorAdapter.run(req);

        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: EventEntity,
        });

        const realm = useRequestIdentityRealm(req);
        if (data.realm_id) {
            if (!isRealmResourceWritable(realm, data.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this event.');
            }
        } else {
            data.realm_id = realm.id;
        }

        const repository = this.dataSource.getRepository(EventEntity);
        const entity = repository.create(data);

        await repository.save(entity);

        res.statusCode = 201;
        return entity;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheckOneOf({
            name: [
                PermissionName.EVENT_READ,
                PermissionName.EVENT_DELETE,
            ],
        });

        const repository = this.dataSource.getRepository(EventEntity);
        const query = repository.createQueryBuilder('ev');
        query.groupBy('ev.id');

        const { pagination } = applyQuery(query, useRequestQuery(req), {
            defaultAlias: 'ev',
            filters: {
                allowed: [
                    'scope',
                    'name',
                    'ref_type',
                    'ref_id',
                    'realm_id',
                    'created_at',
                    'updated_at',
                ],
            },
            pagination: { maxLimit: 50 },
            relations: {
                allowed: [],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            sort: {
                allowed: [
                    'expires_at',
                    'created_at',
                    'updated_at',
                ],
            },
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

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
    ) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheckOneOf({
            name: [
                PermissionName.EVENT_READ,
                PermissionName.EVENT_DELETE,
            ],
        });

        const repository = this.dataSource.getRepository(EventEntity);
        const query = repository.createQueryBuilder('event')
            .where('event.id = :id', { id });

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
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheck({ name: PermissionName.EVENT_DELETE });

        const repository = this.dataSource.getRepository(EventEntity);

        const entity = await repository.findOneBy({ id });

        if (!entity) {
            throw new NotFoundError();
        }

        if (entity.realm_id) {
            const realm = useRequestIdentityRealm(req);
            if (!isRealmResourceWritable(realm, entity.realm_id)) {
                throw new ForbiddenError('You are not permitted to delete this event.');
            }
        }

        const { id: entityId } = entity;

        await repository.remove(entity);

        entity.id = entityId;

        res.statusCode = 202;
        return entity;
    }
}
