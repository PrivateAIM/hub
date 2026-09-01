/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventName, ObjectLiteral } from '@privateaim/kit';

export type EntityEventDestination = {
    namespace?: string | string[],
    channel: string | string[]
};

export type EntityEventDestinations = EntityEventDestination[];

export type EntityEventDestinationsFn<
    T extends ObjectLiteral =ObjectLiteral,
> = (data: T) => EntityEventDestination[];

export type EntityEventMetadata = {
    refType: string,
    refId?: string,

    event: `${DomainEventName}`,

    requestPath?: string | null,
    requestMethod?: string | null;
    requestIpAddress?: string | null;
    requestUserAgent?: string | null;

    actorType?: string | null;
    actorId?: string | null;
    actorName?: string | null;
};

export type EntityEventPublishOptions<
    T extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    /**
     * Pre-mutation snapshot, `updated` events only. IN-PROCESS ONLY: the redis and
     * socket handlers must keep building their wire payload as an explicit literal —
     * never `{ ...ctx }` — so this never leaves the process. Its only reader is
     * @privateaim/server-telemetry-kit's EntityEventHandler, which reduces it to a diff.
     */
    dataPrevious?: T,
    metadata: EntityEventMetadata,
    destinations: EntityEventDestinations | EntityEventDestinationsFn<T>
};

export interface IEntityEventPublisher {
    publish<T extends ObjectLiteral = ObjectLiteral>(ctx: EntityEventPublishOptions<T>) : Promise<void>;
    safePublish<T extends ObjectLiteral = ObjectLiteral>(ctx: EntityEventPublishOptions<T>) : Promise<void>;
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
