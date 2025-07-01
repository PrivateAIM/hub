/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDomainEventPublisher } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import {
    EventSubscriber,
} from 'typeorm';
import type {
    AnalysisNode,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { AnalysisNodeEntity } from '../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisNode,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.ANALYSIS_NODE,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN, id),
                namespace: buildDomainNamespaceName(data.node_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT, id),
                namespace: buildDomainNamespaceName(data.analysis_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT, id),
                namespace: buildDomainNamespaceName(),
            },
        ],
    });
}

@EventSubscriber()
export class AnalysisNodeSubscriber implements EntitySubscriberInterface<AnalysisNodeEntity> {
    listenTo(): CallableFunction | string {
        return AnalysisNodeEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisNodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<AnalysisNodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisNodeEntity);
    }

    async beforeRemove(event: RemoveEvent<AnalysisNodeEntity>): Promise<any> {
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
