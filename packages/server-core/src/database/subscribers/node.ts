/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core';
import { publishDomainEvent, useRedisPublishClient } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { NodeEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Node,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
        {
            type: DomainType.NODE,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.NODE, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.NODE, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    );
}

@EventSubscriber()
export class NodeSubscriber implements EntitySubscriberInterface<NodeEntity> {
    listenTo(): CallableFunction | string {
        return NodeEntity;
    }

    async afterInsert(event: InsertEvent<NodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<NodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as NodeEntity);
    }

    async beforeRemove(event: RemoveEvent<NodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
