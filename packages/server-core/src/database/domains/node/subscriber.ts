/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    DomainType,
} from '@privateaim/core-kit';
import type {
    EntitySubscriberInterface,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { NodeEntity } from './entity';
import { isNodeRobotServiceUsable, useNodeRobotService } from '../../../services';

@EventSubscriber()
export class NodeSubscriber extends BaseSubscriber<NodeEntity> implements EntitySubscriberInterface<NodeEntity> {
    constructor() {
        super({
            refType: DomainType.NODE,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.NODE,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.NODE, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.NODE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.NODE, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    async afterInsert(event: InsertEvent<NodeEntity>): Promise<any> {
        await super.afterInsert(event);

        if (isNodeRobotServiceUsable()) {
            const nodeRobotService = useNodeRobotService();
            const robot = await nodeRobotService.save(event.entity);
            await nodeRobotService.assignPermissions(robot);
        }
    }

    async afterUpdate(event: UpdateEvent<NodeEntity>): Promise<any> {
        await super.afterUpdate(event);

        if (isNodeRobotServiceUsable()) {
            const nodeRobotService = useNodeRobotService();
            const robot = await nodeRobotService.save({
                ...(event.databaseEntity || {}),
                ...event.entity,
            } as NodeEntity);
            await nodeRobotService.assignPermissions(robot);
        }
    }

    async afterRemove(event: RemoveEvent<NodeEntity>): Promise<any> {
        if (isNodeRobotServiceUsable()) {
            const nodeRobotService = useNodeRobotService();
            await nodeRobotService.delete(event.entity || event.databaseEntity);
        }
    }

    listenTo(): CallableFunction | string {
        return NodeEntity;
    }
}
