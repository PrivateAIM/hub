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
import { MasterImageEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class MasterImageSubscriber extends BaseSubscriber<
MasterImageEntity
> implements EntitySubscriberInterface<MasterImageEntity> {
    constructor() {
        super(DomainType.MASTER_IMAGE, [
            {
                channel: (id) => buildDomainChannelName(DomainType.MASTER_IMAGE, id),
                namespace: buildDomainNamespaceName(),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return MasterImageEntity;
    }
}
