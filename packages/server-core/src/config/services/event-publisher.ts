/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { EntityEventHandler } from '@privateaim/server-telemetry-kit';
import {
    EntityEventPublisher,
    EntityEventRedisHandler,
    EntityEventSocketHandler,
    isRedisClientUsable,
    setEntityEventPublisherFactory,
    useRedisClient,
} from '@privateaim/server-kit';

export function configureEventPublisher() {
    setEntityEventPublisherFactory(() => {
        const publisher = new EntityEventPublisher();

        if (isRedisClientUsable()) {
            const client = useRedisClient();

            publisher.register(new EntityEventRedisHandler(client));
            publisher.register(new EntityEventSocketHandler(client));
        }

        publisher.register(new EntityEventHandler());

        return publisher;
    });
}
