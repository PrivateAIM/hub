/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { GenericEventMap } from '@posva/event-emitter';

/**
 * Transforms a non tuple into a tuple with the value but keeps tuples as is.
 * @internal
 */
export type ToTuple<T> = T extends [unknown, ...unknown[]] | [] ? T : [T];

/**
 * Event handler function. Transforms tuples into rest parameters.
 * @internal
 */
export type Handler<Payload> = (...payload: ToTuple<Payload>) => void;

/**
 * Event handler function for the `'*'` event type.
 * @internal
 */
export type WildcardHandler<EventMap extends GenericEventMap> = (
    ...args: {
        [Event in keyof EventMap]: [type: Event, payloads: ToTuple<EventMap[Event]>]
    }[keyof EventMap]
) => void;

/**
 * Convenience type for the returned function of `on`.
 * @internal
 */
export type RemoveEventListener = () => void;
