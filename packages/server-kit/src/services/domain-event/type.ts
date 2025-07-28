/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';

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

export type DomainEventIdentity = {
    id?: string,
    name?: string,
    type?: string,
    ipAddress?: string,
};

export type DomainEventMetadata = {
    domain: string,
    event: string,
    identity?: DomainEventIdentity,
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
