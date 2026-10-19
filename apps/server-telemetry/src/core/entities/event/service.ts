/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import { EventValidator } from '@privateaim/telemetry-kit';
import { PermissionName } from '@privateaim/kit';
import { EntityNotFoundError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import {
    AbstractEntityService,
    appendQueryConditions,
    scopeReadQuery,
} from '@privateaim/server-kit';
import { evaluateRecord } from '@authup/access';
import type { IQuery } from '@rapiq/core';
import { Query, eq } from '@rapiq/core';
import { decodeQuery } from '../../query/index.ts';
import { eventSchema } from './schema.ts';
import type { IEventRepository, IEventService } from './types.ts';

/** EVENT_DELETE implies read: a delete-only role must still list what it can delete. */
const READ_PERMISSIONS = [
    PermissionName.EVENT_READ,
    PermissionName.EVENT_DELETE,
];

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
        const decoded = decodeQuery(query, { schema: eventSchema });

        return this.repository.findMany(await this.scopeRead(decoded, actor));
    }

    async getOne(id: string, actor: ActorContext): Promise<Event> {
        // Read through the collection's scope, so an event outside the
        // actor's reach answers 404 exactly like a missing one.
        const scoped = await this.scopeRead(new Query({}), actor);
        const { data } = await this.repository.findMany(appendQueryConditions(scoped, eq('id', id)));

        if (data.length === 0) {
            throw new EntityNotFoundError({ entity: 'event' });
        }

        return data[0];
    }

    /**
     * The read scope for list and record alike: pre-gated on a read
     * permission and narrowed to what the caller's grant reaches.
     */
    protected scopeRead(query: IQuery, actor: ActorContext): Promise<IQuery> {
        return scopeReadQuery(query, actor, { names: READ_PERMISSIONS });
    }

    async create(data: Partial<Event>, actor: ActorContext): Promise<Event> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.EVENT_CREATE });

        const validated = await this.validator.run(data);

        await this.repository.validateJoinColumns(validated);

        if (!validated.realmId) {
            validated.realmId = this.getActorRealmId(actor);
        }

        // An event's realm column is nullable: an actor without a realm records a global row.
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.EVENT_CREATE,
            realm: validated.realmId ?? null,
            data: { attributes: validated },
        });

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Event> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.EVENT_DELETE });

        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'event' });
        }

        // A realm-less event (null) is reached only by an `ownOrNull`/`any`
        // grant. Read raw: a row whose projection dropped the realm throws
        // instead of reading as global.
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.EVENT_DELETE,
            realm: entity.realmId,
            data: { attributes: entity },
        });

        const { id: entityId } = entity;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
