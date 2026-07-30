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
} from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import type { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { ProjectNodeEntity } from '../../entities/project-node.ts';

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

                if (data.projectRealmId) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.projectRealmId],
                        channel: DomainType.PROJECT_NODE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.projectRealmId],
                        channel: [DomainType.PROJECT_NODE, data.id],
                    });
                }

                if (data.nodeRealmId) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.nodeRealmId],
                        channel: DomainType.PROJECT_NODE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.nodeRealmId],
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
