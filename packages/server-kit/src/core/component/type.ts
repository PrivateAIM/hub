/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';
import type { ComponentHandler, ComponentHandlerFn } from './handler';

export type ComponentData = ObjectLiteral;
export type ComponentMetadata = ObjectLiteral;

export type ComponentStartFn = () => Promise<void> | void;

export type ComponentTriggerFn = (
    key: string,
    value?: ObjectLiteral,
    metadata?: ObjectLiteral
) => Promise<void> | void;

export interface ComponentWithTrigger {
    trigger: ComponentTriggerFn
}

export type Component = {
    start: ComponentStartFn,
    trigger?: ComponentTriggerFn,
};

export type ComponentErrorOptions = {
    code?: string | null,
    message?: string
    cause?: unknown
};

export type ComponentEventMap = {
    [key: string]: [ComponentData, ComponentMetadata]
};

export type ComponentHandleFnArgs<
    EventMap extends ComponentEventMap = ComponentEventMap,
> = {
    [K in keyof EventMap]: [key: K, data: EventMap[K][0], metadata?: EventMap[K][1] | undefined]
}[keyof EventMap];

export type ComponentHandleFn<
    EventMap extends ComponentEventMap = ComponentEventMap,
> = (
    ...input: ComponentHandleFnArgs<EventMap>
) => Promise<void> | void;

export type ComponentHandlers<EventMap extends ComponentEventMap> = Map<
keyof EventMap | '*',
{
    [Key in keyof EventMap]?: ComponentHandler<EventMap, Key> | ComponentHandlerFn<EventMap, Key>
}[keyof EventMap]
>;
