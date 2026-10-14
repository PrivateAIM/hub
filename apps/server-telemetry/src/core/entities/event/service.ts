/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import { EventValidator } from '@privateaim/telemetry-kit';
import {
    PermissionName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, scopeReadQuery } from '@privateaim/server-kit';
import type { IQuery } from '@rapiq/core';
import { Query, eq } from '@rapiq/core';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { eventSchema } from './schema.ts';
import type { IEventRepository, IEventService } from './types.ts';

type EventServiceContext = {
    repository: IEventRepository;
};

export class EventService extends AbstractEntityService implements IEventService {
    protected repository: IEventRepository;

    protected validator: EventValidator;

    constructor(ctx: EventServiceContext) {
        super();
        this.repository = ctx.repository;
        this.validator = new EventValidator();
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<Event>> {
        return this.repository.findMany(await this.scopeQuery(decodeQuery(query, { schema: eventSchema }), actor));
    }

    async getOne(id: string, actor: ActorContext): Promise<Event> {
        // Read through the collection's scope, so an event outside the
        // actor's reach answers 404 exactly like a missing one.
        const query = await this.scopeQuery(new Query({}), actor);
        const { data } = await this.repository.findMany(appendQueryConditions(query, eq('id', id)));

        if (data.length === 0) {
            throw new EntityNotFoundError({ entity: 'event' });
        }

        return data[0];
    }

    protected scopeQuery(query: IQuery, actor: ActorContext): Promise<IQuery> {
        return scopeReadQuery(query, actor, {
            names: [
                PermissionName.EVENT_READ,
                PermissionName.EVENT_DELETE,
            ],
        });
    }

    async create(data: Partial<Event>, actor: ActorContext): Promise<Event> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.EVENT_CREATE });

        const validated = await this.validator.run(data);

        await this.repository.validateJoinColumns(validated);

        if (validated.realmId) {
            if (!isRealmResourceWritable(actor.realm, validated.realmId)) {
                throw new PermissionDeniedError('You are not permitted to create this event.');
            }
        } else {
            validated.realmId = this.getActorRealmId(actor);
        }

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Event> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.EVENT_DELETE });

        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'event' });
        }

        if (entity.realmId) {
            if (!isRealmResourceWritable(actor.realm, entity.realmId)) {
                throw new PermissionDeniedError('You are not permitted to delete this event.');
            }
        }

        const { id: entityId } = entity;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
