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
    AnalysisBucketFile,
} from '@privateaim/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core';
import { AnalysisBucketFileEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisBucketFile,
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
export class AnalysisFileSubscriber implements EntitySubscriberInterface<AnalysisBucketFileEntity> {
    listenTo(): CallableFunction | string {
        return AnalysisBucketFileEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisBucketFileEntity>): Promise<any> {
        try {
            await publishEvent(DomainEventName.CREATED, event.entity);
        } catch (e) {
            useLogger().error(e);
            throw e;
        }
    }

    async afterUpdate(event: UpdateEvent<AnalysisBucketFileEntity>): Promise<any> {
        try {
            await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisBucketFileEntity);
        } catch (e) {
            useLogger().error(e);
            throw e;
        }
    }

    async beforeRemove(event: RemoveEvent<AnalysisBucketFileEntity>): Promise<any> {
        try {
            await publishEvent(DomainEventName.DELETED, event.entity);
        } catch (e) {
            useLogger().error(e);
            throw e;
        }
    }
}
