/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';

export type DomainEventDestination = {
    namespace?: string | string[],
    channel: string | string[]
};

export type DomainEventDestinations = DomainEventDestination[];

export type DomainEventDestinationsFn<
    T extends ObjectLiteral =ObjectLiteral,
> = (data: T) => DomainEventDestination[];

export type DomainEventMetadata = {
    domain: string,
    event: string,

    request_path?: string | null,
    request_method?: string | null;
    request_ip_address?: string | null;
    request_user_agent?: string | null;

    actor_type?: string | null;
    actor_id?: string | null;
    actor_name?: string | null;
};

export type DomainEventPublishOptions<
    T extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    dataPrevious?: T,
    metadata: DomainEventMetadata,
    destinations: DomainEventDestinations | DomainEventDestinationsFn<T>
};

export interface IDomainEventPublisher {
    publish(ctx: DomainEventPublishOptions) : Promise<void>;
}

export type DomainEventConsumeOptions<
    T extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    dataPrevious?: T,
    metadata: DomainEventMetadata,
    destinations: DomainEventDestinations
};

export interface IDomainEventConsumer {
    consume(ctx: DomainEventConsumeOptions) : Promise<void>;
}
