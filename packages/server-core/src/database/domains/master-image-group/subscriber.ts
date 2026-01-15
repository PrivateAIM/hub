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
import { DomainEventNamespace } from '@privateaim/kit';
import { MasterImageGroupEntity } from './entity.ts';

@EventSubscriber()
export class MasterImageGroupSubscriber extends BaseSubscriber<
MasterImageGroupEntity
> implements EntitySubscriberInterface<MasterImageGroupEntity> {
    constructor() {
        super({
            refType: DomainType.MASTER_IMAGE_GROUP,
            destinations: (data) => [
                {
                    namespace: DomainEventNamespace,
                    channel: DomainType.MASTER_IMAGE_GROUP,
                },
                {

                    namespace: DomainEventNamespace,
                    channel: [DomainType.MASTER_IMAGE_GROUP, data.id],
                },
            ],
        });
    }

    listenTo(): CallableFunction | string {
        return MasterImageGroupEntity;
    }
}
