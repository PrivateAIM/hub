/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@privateaim/kit';

export type EntityEventDestination = {
    namespace?: string | string[],
    channel: string | string[]
};

export type EntityEventDestinations = EntityEventDestination[];

export type EntityEventDestinationsFn<
    T extends ObjectLiteral =ObjectLiteral,
> = (data: T) => EntityEventDestination[];

export type EntityEventMetadata = {
    ref_type: string,
    ref_id?: string,

    event: string,

    request_path?: string | null,
    request_method?: string | null;
    request_ip_address?: string | null;
    request_user_agent?: string | null;

    actor_type?: string | null;
    actor_id?: string | null;
    actor_name?: string | null;
};

export type EntityEventPublishOptions<
    T extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    dataPrevious?: T,
    metadata: EntityEventMetadata,
    destinations: EntityEventDestinations | EntityEventDestinationsFn<T>
};

export interface IEntityEventPublisher {
    publish(ctx: EntityEventPublishOptions) : Promise<void>;
}

export type EntityEventHandleOptions<
    T extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    dataPrevious?: T,
    metadata: EntityEventMetadata,
    destinations: EntityEventDestinations
};

export interface IEntityEventHandler {
    handle(ctx: EntityEventHandleOptions) : Promise<void>;
}
