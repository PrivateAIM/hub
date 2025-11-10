/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../../type';
import type { ToTuple } from '../../event-emitter';

import type { ComponentEvents } from '../type';

export type ComponentEmitFn = (
    type: string,
    data?: ObjectLiteral,
    metadata?: ObjectLiteral
) => Promise<void> | void;

export interface ComponentSubscriber<
    EventMap extends ComponentEvents = ComponentEvents,
> {
    emit<Key extends keyof EventMap>(
        type: Key,
        ...payload: ToTuple<EventMap[Key]>
    ) : Promise<void> | void;
}

// todo: metadata should contain { target: { service: 'xxx', component: 'xxx }
