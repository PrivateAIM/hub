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
import { RegistryProjectEntity } from './entity';

@EventSubscriber()
export class RegistryProjectSubscriber extends BaseSubscriber<
RegistryProjectEntity
> implements EntitySubscriberInterface<RegistryProjectEntity> {
    constructor() {
        super({
            domain: DomainType.REGISTRY_PROJECT,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.REGISTRY_PROJECT,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.REGISTRY_PROJECT, data.id],
                    },
                ];

                return destinations;
            },
        });
    }

    listenTo(): CallableFunction | string {
        return RegistryProjectEntity;
    }
}
