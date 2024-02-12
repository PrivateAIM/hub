/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@privateaim/server-kit';
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
} from '@privateaim/core';
import {
    DomainEventName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core';
import {useRedisClient, useRedisPublishClient} from "../../core";
import { AnalysisNodeEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisNode,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
        {
            type: DomainType.ANALYSIS_NODE,
            event,
            data,
        },
        [
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
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT, id),
            },
        ],
    );
}

@EventSubscriber()
export class TrainStationSubscriber implements EntitySubscriberInterface<AnalysisNodeEntity> {
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
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
