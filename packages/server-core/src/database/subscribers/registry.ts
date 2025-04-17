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
import { EventSubscriber } from 'typeorm';
import {
    DomainEventName,
    DomainType,

    Registry,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { RegistryEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Registry,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.REGISTRY,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.REGISTRY, id),
                namespace: buildDomainNamespaceName(),
            },
        ],
    });
}

@EventSubscriber()
export class RegistrySubscriber implements EntitySubscriberInterface<RegistryEntity> {
    listenTo(): CallableFunction | string {
        return RegistryEntity;
    }

    async afterInsert(event: InsertEvent<RegistryEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<RegistryEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as RegistryEntity);
    }

    async beforeRemove(event: RemoveEvent<RegistryEntity>): Promise<any> {
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
