/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';
import type { EventActor, EventDataRequest } from '@privateaim/core-kit';

export type DomainEventChannelName = string | ((id?: string) => string);
export type DomainEventNamespaceName<
    T extends ObjectLiteral = ObjectLiteral,
> = string | ((data: T) => string);

export type DomainEventDestination<
    T extends ObjectLiteral = ObjectLiteral,
> = {
    namespace?: DomainEventNamespaceName<T>,
    channel: DomainEventChannelName
};

export type DomainEventDestinations<
T extends ObjectLiteral =ObjectLiteral,
> = DomainEventDestination<T>[];

export type DomainEventMetadata = {
    domain: string,
    event: string,
    request?: EventDataRequest,
    actor?: EventActor
};

export type DomainEventPublishOptions<
    T extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    dataPrevious?: T,
    metadata: DomainEventMetadata,
    destinations: DomainEventDestinations<T['data']>
};

export interface IDomainEventPublisher {
    publish(ctx: DomainEventPublishOptions) : Promise<void>;
}
