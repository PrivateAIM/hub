/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDomainEventPublisher } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber as TEventSubscriber } from 'typeorm';
import {
    DomainEventName,
    DomainType,
    Event,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { EventEntity } from '../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Event,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.EVENT,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.EVENT, id),
                namespace: buildDomainNamespaceName(),
            },
        ],
    });
}

@TEventSubscriber()
export class EventSubscriber implements EntitySubscriberInterface<EventEntity> {
    listenTo(): CallableFunction | string {
        return EventEntity;
    }

    async afterInsert(event: InsertEvent<EventEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<EventEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as EventEntity);
    }

    async beforeRemove(event: RemoveEvent<EventEntity>): Promise<any> {
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
