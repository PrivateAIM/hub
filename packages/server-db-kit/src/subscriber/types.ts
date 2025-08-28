/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    EntityEventDestinations,
    EntityEventDestinationsFn,
    EntityEventMetadata,
    ObjectLiteral,
} from '@privateaim/server-kit';

export type SubscriberPublishPayload<T> = {
    type: string,
    data: T,
    dataPrevious?: T,
    metadata?: Partial<EntityEventMetadata>,
};

export type BaseSubscriberContext<
    RECORD extends ObjectLiteral = ObjectLiteral,
> = {
    refType: string,
    destinations: EntityEventDestinations | EntityEventDestinationsFn<RECORD>,
};
