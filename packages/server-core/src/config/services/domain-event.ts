/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { useDomainEventPublisherSinga } from '@privateaim/server-kit';
import { DatabaseDomainEventConsumer } from '../../database/domain-event';

export function configureDomainEventPublisher() {
    const singa = useDomainEventPublisherSinga();

    const factory = singa.getFactory();

    singa.setFactory(() => {
        const instance = factory();

        instance.addConsumer(new DatabaseDomainEventConsumer());

        return instance;
    });
}
