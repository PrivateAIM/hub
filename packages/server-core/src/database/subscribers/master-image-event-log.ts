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
import type {
    MasterImageEventLog,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import { MasterImageEventLogEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: MasterImageEventLog,
) {
    const publisher = useDomainEventPublisher();
    await publisher.publish({
        data: {
            type: DomainType.MASTER_IMAGE_EVENT_LOG,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.MASTER_IMAGE_EVENT_LOG, id),
            },
        ],
    });
}

@EventSubscriber()
export class MasterImageEventLogSubscriber implements EntitySubscriberInterface<MasterImageEventLogEntity> {
    listenTo(): CallableFunction | string {
        return MasterImageEventLogEntity;
    }

    async afterInsert(event: InsertEvent<MasterImageEventLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<MasterImageEventLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as MasterImageEventLogEntity);
    }

    async beforeRemove(event: RemoveEvent<MasterImageEventLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
