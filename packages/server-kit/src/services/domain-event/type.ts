/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventRecord, ObjectLiteral } from '@privateaim/kit';

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

export type DomainEventPublishContext<
    T extends DomainEventRecord = DomainEventRecord,
> = {
    data: T,
    destinations: DomainEventDestinations<T['data']>
};

export interface IDomainEventPublisher {
    publish(ctx: DomainEventPublishContext) : Promise<void>;
}
