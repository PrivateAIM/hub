/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@personalhealthtrain/server-core';
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
} from '@personalhealthtrain/core';
import {
    DomainEventName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/core';
import { AnalysisNodeEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisNode,
) {
    await publishDomainEvent(
        {
            type: DomainType.TRAIN_STATION,
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
                channel: (id) => buildDomainChannelName(DomainType.TRAIN_STATION, id),
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
