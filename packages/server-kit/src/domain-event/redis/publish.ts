/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainEventName } from '@privateaim/core';
import type { DomainsEventContext } from '@privateaim/core';
import type { Client } from 'redis-extension';
import type { DomainEventDestinations } from '../type';
import { buildDomainEventChannelName, transformDomainEventData } from '../utils';

export async function publishDomainRedisEvent(
    client: Client,
    context: DomainsEventContext,
    destinations: DomainEventDestinations,
) : Promise<any> {
    context = transformDomainEventData(context);

    const json = JSON.stringify(context);

    const pipeline = client.pipeline();
    for (let i = 0; i < destinations.length; i++) {
        const { namespace } = destinations[i];
        const keyPrefix = (namespace ? `${namespace}:` : '');

        let key = keyPrefix + buildDomainEventChannelName(destinations[i].channel);
        pipeline.publish(key, json);

        if (
            context.event !== DomainEventName.CREATED &&
            typeof destinations[i].channel === 'function'
        ) {
            key = keyPrefix + buildDomainEventChannelName(destinations[i].channel, context.data.id);
            pipeline.publish(key, json);
        }
    }

    return pipeline.exec();
}
