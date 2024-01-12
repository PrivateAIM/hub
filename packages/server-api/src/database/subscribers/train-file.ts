/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@personalhealthtrain/server-core';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import type {
    AnalysisFile,
} from '@personalhealthtrain/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/core';
import { TrainFileEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisFile,
) {
    await publishDomainEvent(
        {
            type: DomainType.ANALYSIS_FILE,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_FILE, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_FILE, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    );
}
@EventSubscriber()
export class TrainFileSubscriber implements EntitySubscriberInterface<TrainFileEntity> {
    listenTo(): CallableFunction | string {
        return TrainFileEntity;
    }

    async afterInsert(event: InsertEvent<TrainFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<TrainFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as TrainFileEntity);
    }

    async beforeRemove(event: RemoveEvent<TrainFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
