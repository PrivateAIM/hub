/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainType } from '@privateaim/core-kit';
import { DomainEventName } from '@privateaim/core-kit';
import type { ObjectLiteral } from '@privateaim/kit';
import type { DomainEventDestinations, DomainEventMetadata, DomainEventPublisher } from '@privateaim/server-kit';
import { useDomainEventPublisher } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';

export type SubscriberPublishPayload<T> = {
    type: `${DomainEventName}`,
    data: T,
    dataPrevious?: T,
    metadata?: Partial<DomainEventMetadata>,
};

export class BaseSubscriber<T extends ObjectLiteral> implements EntitySubscriberInterface<T> {
    protected publisher: DomainEventPublisher;

    protected destinations : DomainEventDestinations<T>;

    protected type: `${DomainType}`;

    constructor(
        type: `${DomainType}`,
        destinations: DomainEventDestinations<T> = [],
    ) {
        this.type = type;
        this.publisher = useDomainEventPublisher();
        this.destinations = destinations;
    }

    async afterInsert(event: InsertEvent<T>): Promise<any> {
        await this.publish({
            data: event.entity,
            type: DomainEventName.CREATED,
            metadata: event.queryRunner.data,
        });
    }

    async afterUpdate(event: UpdateEvent<T>): Promise<any> {
        await this.publish({
            type: DomainEventName.UPDATED,
            data: event.entity as T,
            dataPrevious: event.databaseEntity,
            metadata: event.queryRunner.data,
        });
    }

    async beforeRemove(event: RemoveEvent<T>): Promise<any> {
        if (event.entity) {
            await this.publish({
                type: DomainEventName.DELETED,
                data: event.entity as T,
                metadata: event.queryRunner.data,
            });
        }
    }

    async publish(payload: SubscriberPublishPayload<T>) {
        await this.publisher.safePublish({
            data: payload.data,
            dataPrevious: payload.dataPrevious,
            metadata: {
                domain: this.type,
                event: payload.type,
                ...(payload.metadata ? payload.metadata : {}),
            },
            destinations: this.destinations,
        });
    }
}
