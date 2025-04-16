/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventName, DomainEventSubscriptionName,
} from './constants';
import type {
    DomainEventFullName, DomainEventSubscriptionFullName,
} from './types';

export function buildDomainEventFullName<T extends string>(
    type: T,
    event: `${DomainEventName}`,
) : DomainEventFullName<T> {
    const eventCapitalized = event.substring(0, 1).toUpperCase() + event.substring(1);

    return type + eventCapitalized as DomainEventFullName<T>;
}

export function buildDomainEventSubscriptionFullName<
    T extends string,
>(
    type: T,
    event: `${DomainEventSubscriptionName}`,
) : DomainEventSubscriptionFullName<T> {
    const eventCapitalized = event.substring(0, 1).toUpperCase() + event.substring(1);

    return type + eventCapitalized as DomainEventSubscriptionFullName<T>;
}

export function buildDomainChannelName(type: string, id?: string | number) {
    if (id) {
        const idSerialized = `${id}`;
        if (idSerialized.length > 0) {
            return `${type}:${idSerialized}`;
        }
    }

    return type;
}

export function buildDomainNamespaceName(id?: string) {
    return id ?
        `/resources:${id}` :
        '/resources';
}
