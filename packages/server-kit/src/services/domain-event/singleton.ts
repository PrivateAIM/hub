/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { isRedisClientUsable, useRedisClient } from '../redis';
import { DomainEventPublisher } from './module';
import { DomainEventRedisPublisher } from './redis';
import { DomainEventSocketPublisher } from './socket';

const instance = singa<DomainEventPublisher>({
    name: 'domainEventPublisher',
    factory: () => {
        const publisher = new DomainEventPublisher();

        if (isRedisClientUsable()) {
            const client = useRedisClient();

            publisher.addPublisher(new DomainEventRedisPublisher(client));
            publisher.addPublisher(new DomainEventSocketPublisher(client));
        }

        return publisher;
    },
});

export function useDomainEventPublisher() {
    return instance.use();
}
