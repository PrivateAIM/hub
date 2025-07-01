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
    AnalysisLog,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { AnalysisLogEntity } from '../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisLog,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.ANALYSIS_LOG,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_LOG, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_LOG, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    });
}

@EventSubscriber()
export class AnalysisLogSubscriber implements EntitySubscriberInterface<AnalysisLogEntity> {
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
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
