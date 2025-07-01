/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { useDomainEventPublisher } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { NodeEntity } from '../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Node,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.NODE,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.NODE, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.NODE, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    });
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
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
