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
import type { RegistryProject } from '@privateaim/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core';
import { RegistryProjectEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: RegistryProject,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
        {
            type: DomainType.REGISTRY_PROJECT,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.REGISTRY_PROJECT, id),
            },
        ],
    );
}

@EventSubscriber()
export class RegistryProjectSubscriber implements EntitySubscriberInterface<RegistryProjectEntity> {
    listenTo(): CallableFunction | string {
        return RegistryProjectEntity;
    }

    async afterInsert(event: InsertEvent<RegistryProjectEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<RegistryProjectEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as RegistryProjectEntity);
    }

    async beforeRemove(event: RemoveEvent<RegistryProjectEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
