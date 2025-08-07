/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventDestinations,
    DomainEventDestinationsFn,
    DomainEventMetadata,
    ObjectLiteral,
} from '@privateaim/server-kit';

export type SubscriberPublishPayload<T> = {
    type: string,
    data: T,
    dataPrevious?: T,
    metadata?: Partial<DomainEventMetadata>,
};

export type BaseSubscriberContext<
    RECORD extends ObjectLiteral = ObjectLiteral,
> = {
    domain: string,
    destinations: DomainEventDestinations | DomainEventDestinationsFn<RECORD>,
};
