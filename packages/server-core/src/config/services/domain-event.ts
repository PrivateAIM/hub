/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { useDomainEventPublisherSinga } from '@privateaim/server-kit';
import { DomainEventDatabasePublisher } from '../../services/domain-event';

export function configureDomainEventPublisher() {
    const singa = useDomainEventPublisherSinga();

    const factory = singa.getFactory();

    singa.setFactory(() => {
        const instance = factory();

        instance.addPublisher(new DomainEventDatabasePublisher());

        return instance;
    });
}
