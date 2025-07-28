/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
} from 'typeorm';
import { EventSubscriber as TEventSubscriber } from 'typeorm';
import {
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { EventEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@TEventSubscriber()
export class EventSubscriber extends BaseSubscriber<
EventEntity
> implements EntitySubscriberInterface<EventEntity> {
    constructor() {
        super(DomainType.EVENT, [
            {
                channel: (id) => buildDomainChannelName(DomainType.EVENT, id),
                namespace: buildDomainNamespaceName(),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return EventEntity;
    }
}
