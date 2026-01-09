/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    DomainType,
} from '@privateaim/core-kit';
import {
    EntityManager,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { NodeEntity } from './entity';
import { isNodeClientServiceUsable, useNodeClientService } from '../../../services';

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

        await this.assignRobot(event.entity, event.manager);
    }

    async afterUpdate(event: UpdateEvent<NodeEntity>): Promise<any> {
        await super.afterUpdate(event);

        await this.assignRobot(
            {
                ...(event.databaseEntity || {}),
                ...event.entity,
            } as NodeEntity,
            event.manager,
        );
    }

    async afterRemove(event: RemoveEvent<NodeEntity>): Promise<any> {
        if (!isNodeClientServiceUsable()) return;

        const nodeClientService = useNodeClientService();
        await nodeClientService.dismiss(event.entity || event.databaseEntity);
    }

    protected async assignRobot(entity: NodeEntity, manager: EntityManager) : Promise<void> {
        if (!isNodeClientServiceUsable()) return;

        const nodeClientService = useNodeClientService();
        const prevId = entity.client_id;

        const client = await nodeClientService.assign(entity);
        if (client.id !== prevId) {
            const repository = manager.getRepository(NodeEntity);
            await repository.save(entity);
        }

        await nodeClientService.assignPermissions(client);
    }

    listenTo(): CallableFunction | string {
        return NodeEntity;
    }
}
