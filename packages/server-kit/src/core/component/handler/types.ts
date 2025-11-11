/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentEventMap, ComponentHandleFn } from '../type';

export type ComponentHandlerContext<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Key extends keyof EventMap = keyof EventMap,
> = {
    key: Key & string,
    metadata: EventMap[Key][1],
    handle: ComponentHandleFn<EventMap>
};

export type ComponentHandlerFn<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Key extends keyof EventMap = keyof EventMap,
> = (value: EventMap[Key][0], context: ComponentHandlerContext<EventMap, Key>) => Promise<void> | void;

export type ComponentHandler<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Key extends keyof EventMap = keyof EventMap,
> = {
    initialize?: () => Promise<void> | void;
    handle: ComponentHandlerFn<EventMap, Key>
};
