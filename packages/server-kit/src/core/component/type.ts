/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';
import type { ComponentHandler, ComponentHandlerFn } from './handler';

export type ComponentData = ObjectLiteral;
export type ComponentMetadata = {
    correlationId?: string,
    [key: string]: any
};

export type ComponentStartFn = () => Promise<void> | void;

export type ComponentErrorOptions = {
    code?: string | null,
    message?: string
    cause?: unknown
};

export type ComponentEventMapValue = [ComponentData, ComponentMetadata];
export type ComponentEventMap = Record<string, ComponentEventMapValue>;

export type ComponentHandleOptions<
    EventMap extends ComponentEventMap = ComponentEventMap,
> = {
    handle?: ComponentHandlerFn<EventMap>
};

export type ComponentHandleFnArgsForMap<
    EventMap extends ComponentEventMap = ComponentEventMap,
> = {
    [K in keyof EventMap]: [
        key: K & string,
        data: EventMap[K][0],
        metadata?: EventMap[K][1] | undefined,
        options?: ComponentHandleOptions<EventMap>,
    ]
}[keyof EventMap];

export type ComponentHandlerCallFnForMap<
    EventMap extends ComponentEventMap = ComponentEventMap,
> = (
    ...input: ComponentHandleFnArgsForMap<EventMap>
) => Promise<void> | void;

export type ComponentHandlers<EventMap extends ComponentEventMap> = Map<
keyof EventMap | '*',
{
    [Key in keyof EventMap]?: ComponentHandler<EventMap, Key> | ComponentHandlerFn<EventMap, Key>
}[keyof EventMap]
>;

export interface Component<
    EventMap extends ComponentEventMap = ComponentEventMap,
> {
    start: ComponentStartFn,
    handle?: ComponentHandlerCallFnForMap<EventMap>
}
