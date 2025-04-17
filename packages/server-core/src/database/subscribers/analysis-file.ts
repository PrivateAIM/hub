/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    useDomainEventPublisher,
} from '@privateaim/server-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import type {
    AnalysisBucketFile,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { AnalysisBucketFileEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: AnalysisBucketFile,
) {
    const publisher = useDomainEventPublisher();
    await publisher.safePublish({
        data: {
            type: DomainType.ANALYSIS_BUCKET_FILE,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_BUCKET_FILE, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_BUCKET_FILE, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    });
}
@EventSubscriber()
export class AnalysisFileSubscriber implements EntitySubscriberInterface<AnalysisBucketFileEntity> {
    listenTo(): CallableFunction | string {
        return AnalysisBucketFileEntity;
    }

    async afterInsert(event: InsertEvent<AnalysisBucketFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<AnalysisBucketFileEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as AnalysisBucketFileEntity);
    }

    async beforeRemove(event: RemoveEvent<AnalysisBucketFileEntity>): Promise<any> {
        if (event.entity) {
            await publishEvent(DomainEventName.DELETED, event.entity);
        }
    }
}
