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
import { DomainType } from '@privateaim/storage-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { BucketFileEntity } from './entity.ts';

@EventSubscriber()
export class BucketFileSubscriber extends BaseSubscriber<
BucketFileEntity
> implements EntitySubscriberInterface<BucketFileEntity> {
    constructor() {
        super({
            refType: DomainType.BUCKET_FILE,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.BUCKET_FILE,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.BUCKET_FILE, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.BUCKET_FILE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.BUCKET_FILE, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    listenTo() {
        return BucketFileEntity;
    }
}
