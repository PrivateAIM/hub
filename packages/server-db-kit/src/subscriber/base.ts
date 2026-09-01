/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import { DomainEventName } from '@privateaim/kit';
import type {
    EntityEventDestinations,
    EntityEventDestinationsFn,
    IEntityEventPublisher,
} from '@privateaim/server-kit';
import type {
    EntityMetadata,
    EntitySubscriberInterface,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import type { BaseSubscriberContext, SubscriberPublishPayload } from './types';

/**
 * Columns declared `select: false` are secret-bearing (today `registry.accountSecret`
 * and `registryProject.accountSecret`, the only two in the repo) and must never ride an
 * entity-event payload: `EntityEventSocketHandler` emits `data` verbatim into the
 * `/resources` rooms — joinable with REGISTRY_PROJECT_MANAGE, while the HTTP read of the
 * field requires REGISTRY_MANAGE — and the telemetry `EntityEventHandler` persists a
 * scalar diff of it on an `events` row any EVENT_READ holder in any realm can list.
 *
 * Derived from entity metadata, so `select: false` stays the single declaration rather
 * than a second name list that can drift.
 */
function withoutHiddenColumns<T extends ObjectLiteral>(
    metadata: EntityMetadata | undefined,
    entity: T,
): T {
    if (!entity || !metadata) {
        return entity;
    }

    const hidden = metadata.columns.filter((column) => !column.isSelect);
    if (hidden.length === 0) {
        // keeps the copy — and its side effects — confined to secret-bearing entities
        return entity;
    }

    // a COPY, never `delete` on `event.entity`: the registry project link handler
    // keeps using the live entity's secret after the save that fires this hook
    const output = { ...entity };
    for (const column of hidden) {
        // Take the FIRST path segment, not the whole `propertyPath`. For a plain
        // column the two are identical. For an embedded column the path is dotted
        // (`profile.secret`) and the value lives nested, so `delete output['profile.secret']`
        // would remove nothing and leak it — while `propertyName` ('secret') would
        // delete an unrelated top-level key. Dropping the embedded ROOT is
        // deliberately over-broad and fail-closed: losing the non-secret siblings of
        // a hidden column from an event payload is acceptable, leaking the column is
        // not. Hub declares no embedded columns today, so this changes nothing yet.
        delete output[column.propertyPath.split('.')[0]];
    }

    return output;
}

export class BaseSubscriber<
    RECORD extends ObjectLiteral,
> implements EntitySubscriberInterface<RECORD> {
    private readonly destinations : EntityEventDestinations | EntityEventDestinationsFn<RECORD>;

    private readonly refType: string;

    private publisher?: IEntityEventPublisher;

    constructor(ctx: BaseSubscriberContext<RECORD>) {
        this.refType = ctx.refType;
        this.destinations = ctx.destinations;
        this.publisher = ctx.publisher;
    }

    setPublisher(publisher: IEntityEventPublisher) {
        this.publisher = publisher;
    }

    async afterInsert(event: InsertEvent<RECORD>): Promise<any> {
        await this.publish({
            data: withoutHiddenColumns(event.metadata, event.entity),
            type: DomainEventName.CREATED,
            metadata: event.queryRunner.data,
        });
    }

    async afterUpdate(event: UpdateEvent<RECORD>): Promise<any> {
        await this.publish({
            type: DomainEventName.UPDATED,
            data: withoutHiddenColumns(event.metadata, event.entity as RECORD),
            dataPrevious: event.databaseEntity ?
                withoutHiddenColumns(event.metadata, event.databaseEntity) :
                undefined,
            metadata: event.queryRunner.data,
        });
    }

    async beforeRemove(event: RemoveEvent<RECORD>): Promise<any> {
        if (event.entity) {
            await this.publish({
                type: DomainEventName.DELETED,
                data: withoutHiddenColumns(event.metadata, event.entity as RECORD),
                metadata: event.queryRunner.data,
            });
        }
    }

    async publish(payload: SubscriberPublishPayload<RECORD>) {
        if (!this.publisher) {
            return;
        }

        await this.publisher.safePublish({
            data: payload.data,
            dataPrevious: payload.dataPrevious,
            metadata: {
                refType: this.refType,
                refId: payload.data.id,

                event: payload.type,
                ...(payload.metadata ? payload.metadata : {}),
            },
            destinations: this.destinations,
        });
    }
}
