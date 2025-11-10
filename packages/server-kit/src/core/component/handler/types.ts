/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../../type';
import type { ComponentEmitFn, ComponentSubscriber } from '../emitter';
import type { ComponentData, ComponentMetadata } from '../type';

export type ComponentHandlerEvents = {
    [key: string]: [ComponentData, ComponentMetadata]
};

export type ComponentHandlersOptions = {
    emitter?: ComponentSubscriber
};
export type ComponentHandlerContext<
    KEY extends string = string,
> = {
    key: KEY,
    metadata: ObjectLiteral,
    emit: ComponentEmitFn,
};

export type ComponentHandlerFn<
    KEY extends string = string,
    VALUE extends ObjectLiteral = ObjectLiteral,
> = (value: VALUE, context: ComponentHandlerContext<KEY>) => Promise<void> | void;

export type ComponentHandler<
    KEY extends string = string,
    VALUE extends ObjectLiteral = ObjectLiteral,
> = {
    initialize?: () => Promise<void> | void;
    handle: ComponentHandlerFn<KEY, VALUE>
};
