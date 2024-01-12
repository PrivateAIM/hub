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
    AnalysisLog,
} from '@personalhealthtrain/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/core';
import { AnalysisLogEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisLog,
) {
    await publishDomainEvent(
        {
            type: DomainType.ANALYSIS_LOG,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_LOG, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_LOG, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    );
}

@EventSubscriber()
export class TrainLogSubscriber implements EntitySubscriberInterface<AnalysisLogEntity> {
    listenTo(): CallableFunction | string {
        return AnalysisLogEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<AnalysisLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisLogEntity);
    }

    async beforeRemove(event: RemoveEvent<AnalysisLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
