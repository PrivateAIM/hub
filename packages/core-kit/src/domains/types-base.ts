/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventName } from './constants';

export type DomainEntityWithID = {
    [key: string]: any,
    id: any
};
export type DomainEntityID<T> = T extends DomainEntityWithID ?
    T['id'] :
    never;

export type DomainEventBaseContext = {
    event: `${DomainEventName}`,
    type: string
};
