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

    MasterImage,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { MasterImageEntity } from '../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: MasterImage,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.MASTER_IMAGE,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.MASTER_IMAGE, id),
                namespace: buildDomainNamespaceName(),
            },
        ],
    });
}

@EventSubscriber()
export class MasterImageSubscriber implements EntitySubscriberInterface<MasterImageEntity> {
    listenTo(): CallableFunction | string {
        return MasterImageEntity;
    }

    async afterInsert(event: InsertEvent<MasterImageEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<MasterImageEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as MasterImageEntity);
    }

    async beforeRemove(event: RemoveEvent<MasterImageEntity>): Promise<any> {
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
