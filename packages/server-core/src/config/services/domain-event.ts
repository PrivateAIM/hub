/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventPublisher,
    DomainEventRedisPublisher,
    DomainEventSocketConsumer,
    isRedisClientUsable,
    setDomainEventPublisherFactory,
    useRedisClient,
} from '@privateaim/server-kit';
import { DatabaseDomainEventConsumer } from '../../database/domain-event';

export function configureDomainEventPublisher() {
    setDomainEventPublisherFactory(() => {
        const publisher = new DomainEventPublisher();

        if (isRedisClientUsable()) {
            const client = useRedisClient();

            publisher.addConsumer(new DomainEventRedisPublisher(client));
            publisher.addConsumer(new DomainEventSocketConsumer(client));
        }

        publisher.addConsumer(new DatabaseDomainEventConsumer());

        return publisher;
    });
}
