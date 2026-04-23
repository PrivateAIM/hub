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
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
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
        await actor.permissionChecker.preCheckOneOf({
            name: [
                PermissionName.EVENT_READ,
                PermissionName.EVENT_DELETE,
            ],
        });

        return this.repository.findMany(query);
    }

    async getOne(id: string, actor: ActorContext): Promise<Event> {
        await actor.permissionChecker.preCheckOneOf({
            name: [
                PermissionName.EVENT_READ,
                PermissionName.EVENT_DELETE,
            ],
        });

        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<Event>, actor: ActorContext): Promise<Event> {
        await actor.permissionChecker.preCheck({ name: PermissionName.EVENT_CREATE });

        const validated = await this.validator.run(data);

        await this.repository.validateJoinColumns(validated);

        if (validated.realm_id) {
            if (!isRealmResourceWritable(actor.realm, validated.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this event.');
            }
        } else {
            validated.realm_id = this.getActorRealmId(actor);
        }

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Event> {
        await actor.permissionChecker.preCheck({ name: PermissionName.EVENT_DELETE });

        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        if (entity.realm_id) {
            if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
                throw new ForbiddenError('You are not permitted to delete this event.');
            }
        }

        const { id: entityId } = entity;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
