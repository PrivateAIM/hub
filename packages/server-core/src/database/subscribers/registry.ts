/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent, useRedisPublishClient } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import type {
    Registry,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import { RegistryEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Registry,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
        {
            type: DomainType.REGISTRY,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.REGISTRY, id),
            },
        ],
    );
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
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
