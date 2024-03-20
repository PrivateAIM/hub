/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import type {
    AnalysisFile,
} from '@privateaim/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core';
import { useRedisPublishClient } from '../../core';
import { AnalysisFileEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisFile,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
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
export class AnalysisFileSubscriber implements EntitySubscriberInterface<AnalysisFileEntity> {
    listenTo(): CallableFunction | string {
        return AnalysisFileEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<AnalysisFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisFileEntity);
    }

    async beforeRemove(event: RemoveEvent<AnalysisFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
