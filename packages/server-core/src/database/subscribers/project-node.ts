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
    ProjectNode,
} from '@privateaim/core-kit';
import {
    DomainEventName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { ProjectNodeEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: ProjectNode,
) {
    const publisher = useDomainEventPublisher();
    await publisher.publish({
        data: {
            type: DomainType.PROJECT_NODE,
            event,
            data,
        },
        destinations: [
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, id),
                namespace: buildDomainNamespaceName(data.node_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, id),
                namespace: buildDomainNamespaceName(data.project_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.PROJECT_NODE, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, id),
                namespace: buildDomainNamespaceName(),
            },
        ],
    });
}

@EventSubscriber()
export class ProjectNodeSubscriber implements EntitySubscriberInterface<ProjectNodeEntity> {
    listenTo(): CallableFunction | string {
        return ProjectNodeEntity;
    }

    async afterInsert(event: InsertEvent<ProjectNodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<ProjectNodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as ProjectNodeEntity);
    }

    async beforeRemove(event: RemoveEvent<ProjectNodeEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
