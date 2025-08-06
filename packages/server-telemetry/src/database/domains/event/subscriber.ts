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
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EventEntity } from './entity';

@TypeormEventSubscriber()
export class EventSubscriber extends BaseSubscriber<
EventEntity
> implements EntitySubscriberInterface<EventEntity> {
    constructor() {
        super(DomainType.EVENT, [
            {
                channel: (id) => buildDomainChannelName(DomainType.EVENT, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.EVENT, id),
                namespace: (data) => buildDomainNamespaceName(data.realm_id),
            },
        ]);
    }

    listenTo() {
        return EventEntity;
    }
}
