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
    AnalysisNodeLog,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { AnalysisNodeLogEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisNodeLog,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
        {
            type: DomainType.ANALYSIS_NODE_LOG,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_LOG, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_LOG, id),
                namespace: buildDomainNamespaceName(data.analysis_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_LOG, id),
                namespace: buildDomainNamespaceName(data.node_realm_id),
            },
        ],
    );
}

@EventSubscriber()
export class AnalysisNodeLogSubscriber implements EntitySubscriberInterface<AnalysisNodeLogEntity> {
    listenTo(): CallableFunction | string {
        return AnalysisNodeLogEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisNodeLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<AnalysisNodeLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisNodeLogEntity);
    }

    async beforeRemove(event: RemoveEvent<AnalysisNodeLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
