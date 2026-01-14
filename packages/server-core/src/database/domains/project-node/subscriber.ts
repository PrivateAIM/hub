/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
} from 'typeorm';
import {
    EventSubscriber,
} from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { ProjectNodeEntity } from './entity.ts';

@EventSubscriber()
export class ProjectNodeSubscriber extends BaseSubscriber<
ProjectNodeEntity
> implements EntitySubscriberInterface<ProjectNodeEntity> {
    constructor() {
        super({
            refType: DomainType.PROJECT_NODE,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.PROJECT_NODE,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.PROJECT_NODE, data.id],
                    },
                ];

                if (data.project_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.project_realm_id],
                        channel: DomainType.PROJECT_NODE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.project_realm_id],
                        channel: [DomainType.PROJECT_NODE, data.id],
                    });
                }

                if (data.node_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.node_realm_id],
                        channel: DomainType.PROJECT_NODE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.node_realm_id],
                        channel: [DomainType.PROJECT_NODE, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    listenTo(): CallableFunction | string {
        return ProjectNodeEntity;
    }
}
