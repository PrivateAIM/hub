/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentEventMap } from '../type';

export interface ComponentSubscriber<
    EventMap extends ComponentEventMap = ComponentEventMap,
> {
    emit<Key extends keyof EventMap>(
        type: Key,
        ...payload: EventMap[Key]
    ) : Promise<void> | void;
}

// todo: metadata should contain { target: { service: 'xxx', component: 'xxx }
