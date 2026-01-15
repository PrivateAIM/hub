/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { ProjectEntity } from './entity.ts';

@EventSubscriber()
export class ProjectSubscriber extends BaseSubscriber<
ProjectEntity
> implements EntitySubscriberInterface<ProjectEntity> {
    constructor() {
        super({
            refType: DomainType.PROJECT,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.PROJECT,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.PROJECT, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.PROJECT,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.PROJECT, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    listenTo(): CallableFunction | string {
        return ProjectEntity;
    }
}
