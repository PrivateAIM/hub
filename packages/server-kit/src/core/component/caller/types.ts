/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../../type';
import type { ComponentEventMap, ComponentEventMapValue } from '../type';

export type ComponentCallerPayload<
    EventMapValue extends ComponentEventMapValue = ComponentEventMapValue,
    Metadata extends ObjectLiteral = ObjectLiteral,
> = [data: EventMapValue[0], metadata: EventMapValue[1] & Metadata];

export type ComponentCallerFnArgsForMap<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Metadata extends ObjectLiteral = ObjectLiteral,
> = {
    [K in keyof EventMap]: [
        key: K,
        ...ComponentCallerPayload<EventMap[K], Metadata>,
    ]
}[keyof EventMap];

export interface ComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Metadata extends ObjectLiteral = ObjectLiteral,
> {
    call(
        ...input: ComponentCallerFnArgsForMap<EventMap, Metadata>
    ) : Promise<void>;
}
