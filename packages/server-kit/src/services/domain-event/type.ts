/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventRecord } from '@privateaim/kit';

export type DomainEventChannelName = string | ((id?: string | number) => string);
export type DomainEventDestination = {
    namespace?: string,
    channel: DomainEventChannelName
};

export type DomainEventDestinations = DomainEventDestination[];

export type DomainEventPublishContext<
    T extends DomainEventRecord = DomainEventRecord,
> = {
    data: T,
    destinations: DomainEventDestinations
};

export interface IDomainEventPublisher {
    publish(ctx: DomainEventPublishContext) : Promise<void>;
}
