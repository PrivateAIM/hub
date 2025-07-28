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
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { RegistryEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class RegistrySubscriber extends BaseSubscriber<
RegistryEntity
> implements EntitySubscriberInterface<RegistryEntity> {
    constructor() {
        super(DomainType.REGISTRY, [
            {
                channel: (id) => buildDomainChannelName(DomainType.REGISTRY, id),
                namespace: buildDomainNamespaceName(),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return RegistryEntity;
    }
}
