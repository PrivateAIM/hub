/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    EventSubscriber as TypeormEventSubscriber,
} from 'typeorm';
import type {
    EntitySubscriberInterface,
} from 'typeorm';
import { DomainType } from '@privateaim/telemetry-kit';
import {
    DomainEventNamespace,
} from '@privateaim/kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { EventEntity } from './entity.ts';

@TypeormEventSubscriber()
export class EventSubscriber extends BaseSubscriber<
EventEntity
> implements EntitySubscriberInterface<EventEntity> {
    constructor() {
        super({
            refType: DomainType.EVENT,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.EVENT,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.EVENT, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.EVENT,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.EVENT, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    listenTo() {
        return EventEntity;
    }
}
