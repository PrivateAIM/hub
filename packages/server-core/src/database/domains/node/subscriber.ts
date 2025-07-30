/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import type {
    EntitySubscriberInterface,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { NodeEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class NodeSubscriber extends BaseSubscriber<NodeEntity> implements EntitySubscriberInterface<NodeEntity> {
    constructor() {
        super(DomainType.NODE, [
            {
                channel: (id) => buildDomainChannelName(DomainType.NODE, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.NODE, id),
                namespace: (data) => buildDomainNamespaceName(data.realm_id),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return NodeEntity;
    }
}
