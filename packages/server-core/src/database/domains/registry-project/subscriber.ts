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
import { RegistryProjectEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class RegistryProjectSubscriber extends BaseSubscriber<
RegistryProjectEntity
> implements EntitySubscriberInterface<RegistryProjectEntity> {
    constructor() {
        super(DomainType.REGISTRY_PROJECT, [
            {
                channel: (id) => buildDomainChannelName(DomainType.REGISTRY_PROJECT, id),
                namespace: buildDomainNamespaceName(),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return RegistryProjectEntity;
    }
}
