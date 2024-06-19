/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent, useLogger, useRedisPublishClient } from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import type {
    Analysis,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,

    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { AnalysisEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Analysis,
) {
    await publishDomainEvent(
        useRedisPublishClient(),
        {
            type: DomainType.ANALYSIS,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    );
}
@EventSubscriber()
export class AnalysisSubscriber implements EntitySubscriberInterface<AnalysisEntity> {
    listenTo() {
        return AnalysisEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisEntity>): Promise<any> {
        try {
            await publishEvent(DomainEventName.CREATED, event.entity);
        } catch (e) {
            useLogger().error(e);
            throw e;
        }
    }

    async afterUpdate(event: UpdateEvent<AnalysisEntity>): Promise<any> {
        try {
            await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisEntity);
        } catch (e) {
            useLogger().error(e);
            throw e;
        }
    }

    async beforeRemove(event: RemoveEvent<AnalysisEntity>): Promise<any> {
        try {
            await publishEvent(DomainEventName.DELETED, event.entity);
        } catch (e) {
            useLogger().error(e);
            throw e;
        }
    }
}
