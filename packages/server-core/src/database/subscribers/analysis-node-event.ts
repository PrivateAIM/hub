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
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { AnalysisNodeEventEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisNodeEventEntity,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.ANALYSIS_NODE_EVENT,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_EVENT, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_EVENT, id),
                namespace: buildDomainNamespaceName(data.analysis_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_EVENT, id),
                namespace: buildDomainNamespaceName(data.node_realm_id),
            },
        ],
    });
}

@EventSubscriber()
export class AnalysisNodeEventSubscriber implements EntitySubscriberInterface<AnalysisNodeEventEntity> {
    listenTo(): CallableFunction | string {
        return AnalysisNodeEventEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisNodeEventEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<AnalysisNodeEventEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisNodeEventEntity);
    }

    async beforeRemove(event: RemoveEvent<AnalysisNodeEventEntity>): Promise<any> {
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
