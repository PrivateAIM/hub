/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainsEvents } from '@privateaim/core-kit';
import type { Client } from 'redis-extension';
import { publishDomainRedisEvent } from './redis';
import { publishDomainSocketEvent } from './socket';
import type { DomainEventDestinations } from './type';

export async function publishDomainEvent(
    client: Client,
    context: DomainsEvents,
    destinations: DomainEventDestinations,
) {
    await publishDomainRedisEvent(client, context, destinations);
    publishDomainSocketEvent(client, context, destinations);
}
