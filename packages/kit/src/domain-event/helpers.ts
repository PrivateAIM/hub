/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventFullName } from './types';

export function buildDomainEventFullName<
    ENTITY extends string,
    EVENT extends string,
>(
    type: ENTITY,
    event: EVENT,
) : DomainEventFullName<ENTITY, EVENT> {
    const eventCapitalized = event.substring(0, 1).toUpperCase() + event.substring(1);

    return type + eventCapitalized as DomainEventFullName<ENTITY, EVENT>;
}
