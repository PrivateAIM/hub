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
    MasterImageGroup,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import { MasterImageGroupEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: MasterImageGroup,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
        {
            type: DomainType.MASTER_IMAGE_GROUP,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.MASTER_IMAGE_GROUP, id),
            },
        ],
    );
}

@EventSubscriber()
export class MasterImageGroupSubscriber implements EntitySubscriberInterface<MasterImageGroupEntity> {
    listenTo(): CallableFunction | string {
        return MasterImageGroupEntity;
    }

    async afterInsert(event: InsertEvent<MasterImageGroupEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<MasterImageGroupEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as MasterImageGroupEntity);
    }

    async beforeRemove(event: RemoveEvent<MasterImageGroupEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
